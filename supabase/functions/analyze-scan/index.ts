import OpenAI from "npm:openai";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SCAN_IMAGES_BUCKET = "scan-images";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const MAX_LANDMARK_CANDIDATES = 8;
const OPENAI_CONFIDENCE_FALLBACK = 0.45;
const DEFAULT_OPENAI_VISION_MODEL = "gpt-4.1-mini";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

type CtaAction = "whatsapp" | "book_private_guide" | "custom_itinerary";

interface NearbyLandmarkCandidate {
  id: string;
  name: string;
  category: string | null;
  short_description: string | null;
  full_story: string | null;
  interesting_facts: string[];
  historical_context: string | null;
  best_time_to_visit: string | null;
  average_visit_duration: string | null;
  distance_meters: number;
}

interface NearbyPlace {
  id: string;
  name: string;
  distanceMeters: number;
}

interface AiGuideResult {
  detectedLandmarkId: string | null;
  detectedLandmarkName: string | null;
  confidence: number;
  isUncertain: boolean;
  shortExplanation: string;
  localGuideStory: string;
  interestingFacts: string[];
  bestTimeToVisit: string;
  nearbyPlaces: NearbyPlace[];
  followUpSuggestions: string[];
  cta: {
    title: string;
    message: string;
    action: CtaAction;
  };
}

interface AnalyzeScanContext {
  signedImageUrl: string;
  latitude: number;
  longitude: number;
  locale: string;
  nearbyLandmarks: NearbyLandmarkCandidate[];
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Only POST requests are supported." }, 405);
  }

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const formData = await readMultipartFormData(request);
    const image = getImageFile(formData);
    const { latitude, longitude } = getCoordinates(formData);
    const locale = normalizeLocale(formData.get("locale"));

    const storagePath = buildStoragePath(image);
    await uploadImage(supabase, storagePath, image);
    const signedImageUrl = await createSignedImageUrl(supabase, storagePath);
    const nearbyLandmarks = await queryNearbyLandmarks(supabase, latitude, longitude);

    const result = nearbyLandmarks.length === 0
      ? buildNoNearbyLandmarksResult()
      : await analyzeWithSafeFallback({
        signedImageUrl,
        latitude,
        longitude,
        locale,
        nearbyLandmarks,
      });

    await saveScanHistory(supabase, {
      imageUrl: storagePath,
      latitude,
      longitude,
      result,
    });

    return jsonResponse(result, 200);
  } catch (error) {
    return handleServerError(error);
  }
});

function requireEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new HttpError(500, "missing_server_secret", `Missing required server secret: ${name}`);
  }

  return value;
}

async function readMultipartFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new HttpError(400, "invalid_content_type", "Request must use multipart/form-data.");
  }

  try {
    return await request.formData();
  } catch (error) {
    console.error("Failed to parse multipart form data", error);
    throw new HttpError(400, "invalid_multipart_body", "Could not read uploaded scan image.");
  }
}

function getImageFile(formData: FormData): File {
  const image = formData.get("photo") ?? formData.get("image") ?? formData.get("file");

  if (!(image instanceof File)) {
    throw new HttpError(400, "missing_image", "A scan image file is required.");
  }

  if (!image.type.startsWith("image/")) {
    throw new HttpError(400, "invalid_image", "Uploaded file must be an image.");
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  if (!allowedTypes.has(image.type)) {
    throw new HttpError(400, "unsupported_image_type", "Image must be JPEG, PNG, WEBP, or non-animated GIF.");
  }

  if (image.size <= 0) {
    throw new HttpError(400, "empty_image", "Uploaded image is empty.");
  }

  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    throw new HttpError(400, "image_too_large", "Uploaded image must be 10 MB or smaller.");
  }

  return image;
}

function getCoordinates(formData: FormData): { latitude: number; longitude: number } {
  const latitude = parseCoordinate(formData.get("latitude"), "latitude", -90, 90);
  const longitude = parseCoordinate(formData.get("longitude"), "longitude", -180, 180);

  return { latitude, longitude };
}

function parseCoordinate(value: FormDataEntryValue | null, name: string, min: number, max: number): number {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "missing_coordinates", `Missing ${name}.`);
  }

  const coordinate = Number(value);
  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    throw new HttpError(400, "invalid_coordinates", `Invalid ${name}.`);
  }

  return coordinate;
}

function normalizeLocale(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "en";
  }

  return value.trim().slice(0, 16);
}

function buildStoragePath(image: File): string {
  const extension = getImageExtension(image.type);
  const datePrefix = new Date().toISOString().slice(0, 10);

  return `${datePrefix}/${crypto.randomUUID()}.${extension}`;
}

function getImageExtension(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

async function uploadImage(
  supabase: ReturnType<typeof createClient>,
  storagePath: string,
  image: File,
): Promise<void> {
  const { error } = await supabase.storage
    .from(SCAN_IMAGES_BUCKET)
    .upload(storagePath, image, {
      contentType: image.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase Storage upload failed", error);
    throw new HttpError(500, "storage_upload_failed", "Could not upload scan image.");
  }
}

async function createSignedImageUrl(
  supabase: ReturnType<typeof createClient>,
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SCAN_IMAGES_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("Supabase signed URL creation failed", error);
    throw new HttpError(500, "signed_url_failed", "Could not prepare scan image for analysis.");
  }

  return data.signedUrl;
}

async function queryNearbyLandmarks(
  supabase: ReturnType<typeof createClient>,
  latitude: number,
  longitude: number,
): Promise<NearbyLandmarkCandidate[]> {
  const rpcPayloads = [
    { p_latitude: latitude, p_longitude: longitude, p_limit: MAX_LANDMARK_CANDIDATES },
    { latitude, longitude, limit_count: MAX_LANDMARK_CANDIDATES },
    { lat: latitude, lng: longitude, limit_count: MAX_LANDMARK_CANDIDATES },
  ];

  const errors: unknown[] = [];

  for (const payload of rpcPayloads) {
    const { data, error } = await supabase.rpc("get_nearby_landmarks", payload);

    if (!error) {
      return normalizeNearbyLandmarks(data).slice(0, MAX_LANDMARK_CANDIDATES);
    }

    errors.push(error);
  }

  console.error("Nearby landmark RPC failed", errors);
  throw new HttpError(500, "nearby_landmarks_failed", "Could not find nearby landmarks.");
}

function normalizeNearbyLandmarks(data: unknown): NearbyLandmarkCandidate[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => normalizeNearbyLandmark(item))
    .filter((candidate): candidate is NearbyLandmarkCandidate => candidate !== null)
    .sort((first, second) => first.distance_meters - second.distance_meters);
}

function normalizeNearbyLandmark(item: unknown): NearbyLandmarkCandidate | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = readString(item.id);
  const name = readString(item.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    category: readNullableString(item.category),
    short_description: readNullableString(item.short_description),
    full_story: readNullableString(item.full_story),
    interesting_facts: readStringArray(item.interesting_facts),
    historical_context: readNullableString(item.historical_context),
    best_time_to_visit: readNullableString(item.best_time_to_visit),
    average_visit_duration: readNullableString(item.average_visit_duration),
    distance_meters: readNumber(item.distance_meters ?? item.distanceMeters, Number.MAX_SAFE_INTEGER),
  };
}

function buildSystemPrompt(): string {
  return [
    "You are a friendly local Georgian tour guide helping a traveler identify a landmark from a camera photo.",
    "Return strict JSON only. Do not include markdown, comments, or extra keys.",
    "Use only the provided nearby landmark candidates as the source of truth.",
    "Do not invent historical facts and do not use generic world knowledge as factual support.",
    "If the image does not clearly match one of the candidates, set detectedLandmarkId and detectedLandmarkName to null.",
    "If confidence is below 0.55, set isUncertain to true and start shortExplanation with: "
      + "I’m not fully sure, but based on your location, this may be...",
    "Keep answers short, useful, accurate, and travel-friendly. English is the default unless the locale clearly asks for another language.",
  ].join("\n");
}

function buildUserPrompt(
  latitude: number,
  longitude: number,
  locale: string,
  nearbyLandmarks: NearbyLandmarkCandidate[],
): string {
  return JSON.stringify({
    task: "Analyze the image and match it to at most one nearby landmark candidate.",
    gpsLocation: { latitude, longitude },
    locale,
    nearbyLandmarkCandidates: nearbyLandmarks.map(toOpenAiLandmarkCandidate),
    expectedBehavior: {
      sourceOfTruth: "nearbyLandmarkCandidates only",
      noClearMatch: "Return null landmark fields and explain uncertainty helpfully.",
      lowConfidenceThreshold: 0.55,
      nearbyPlaces: "Use only other provided candidates, sorted by distance.",
      cta: "Choose one action from whatsapp, book_private_guide, or custom_itinerary.",
    },
  });
}

function buildAiGuideResultSchema(): Record<string, unknown> {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      detectedLandmarkId: { type: ["string", "null"] },
      detectedLandmarkName: { type: ["string", "null"] },
      confidence: { type: "number" },
      isUncertain: { type: "boolean" },
      shortExplanation: { type: "string" },
      localGuideStory: { type: "string" },
      interestingFacts: {
        type: "array",
        items: { type: "string" },
      },
      bestTimeToVisit: { type: "string" },
      nearbyPlaces: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            distanceMeters: { type: "number" },
          },
          required: ["id", "name", "distanceMeters"],
        },
      },
      followUpSuggestions: {
        type: "array",
        items: { type: "string" },
      },
      cta: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          action: { type: "string", enum: ["whatsapp", "book_private_guide", "custom_itinerary"] },
        },
        required: ["title", "message", "action"],
      },
    },
    required: [
      "detectedLandmarkId",
      "detectedLandmarkName",
      "confidence",
      "isUncertain",
      "shortExplanation",
      "localGuideStory",
      "interestingFacts",
      "bestTimeToVisit",
      "nearbyPlaces",
      "followUpSuggestions",
      "cta",
    ],
  };
}

async function analyzeImageWithOpenAI(context: AnalyzeScanContext): Promise<AiGuideResult> {
  const model = Deno.env.get("OPENAI_VISION_MODEL")?.trim() || DEFAULT_OPENAI_VISION_MODEL;
  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: buildSystemPrompt() }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildUserPrompt(
              context.latitude,
              context.longitude,
              context.locale,
              context.nearbyLandmarks,
            ),
          },
          { type: "input_image", image_url: context.signedImageUrl, detail: "auto" },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "ai_guide_result",
        strict: true,
        schema: buildAiGuideResultSchema(),
      },
    },
  });

  const result = validateAiGuideResult(parseOpenAiResponseText(response));

  return enforceCandidateBoundaries(result, context.nearbyLandmarks);
}

async function analyzeWithSafeFallback(context: AnalyzeScanContext): Promise<AiGuideResult> {
  try {
    return await analyzeImageWithOpenAI(context);
  } catch (error) {
    console.error("OpenAI vision analysis failed", error);
    return buildOpenAiFailureFallback(context.nearbyLandmarks);
  }
}

function parseOpenAiResponseText(response: unknown): unknown {
  if (!isRecord(response)) {
    throw new Error("Invalid OpenAI response object.");
  }

  const outputText = response.output_text;

  if (typeof outputText === "string" && outputText.trim().length > 0) {
    return JSON.parse(outputText);
  }

  throw new Error("OpenAI response did not include JSON output text.");
}

function validateAiGuideResult(value: unknown): AiGuideResult {
  if (!isRecord(value)) {
    throw new Error("AI result must be an object.");
  }

  const cta = value.cta;
  if (!isRecord(cta)) {
    throw new Error("AI result CTA must be an object.");
  }

  const detectedLandmarkId = readNullableString(value.detectedLandmarkId);
  const detectedLandmarkName = readNullableString(value.detectedLandmarkName);
  const confidence = clampConfidence(readNumber(value.confidence, 0));

  return {
    detectedLandmarkId,
    detectedLandmarkName,
    confidence,
    isUncertain: readBoolean(value.isUncertain, confidence < 0.55),
    shortExplanation: requireString(value.shortExplanation, "shortExplanation"),
    localGuideStory: requireString(value.localGuideStory, "localGuideStory"),
    interestingFacts: readStringArray(value.interestingFacts),
    bestTimeToVisit: requireString(value.bestTimeToVisit, "bestTimeToVisit"),
    nearbyPlaces: readNearbyPlaces(value.nearbyPlaces),
    followUpSuggestions: readStringArray(value.followUpSuggestions),
    cta: {
      title: requireString(cta.title, "cta.title"),
      message: requireString(cta.message, "cta.message"),
      action: readCtaAction(cta.action),
    },
  };
}

function enforceCandidateBoundaries(
  result: AiGuideResult,
  nearbyLandmarks: NearbyLandmarkCandidate[],
): AiGuideResult {
  const candidateById = new Map(nearbyLandmarks.map((candidate) => [candidate.id, candidate]));
  const matchedCandidate = result.detectedLandmarkId
    ? candidateById.get(result.detectedLandmarkId) ?? null
    : null;
  const confidence = clampConfidence(result.confidence);
  const isUncertain = result.isUncertain || confidence < 0.55 || matchedCandidate === null;
  const lowConfidencePrefix = "I’m not fully sure, but based on your location, this may be...";
  const shortExplanation = confidence < 0.55 && !result.shortExplanation.startsWith(lowConfidencePrefix)
    ? `${lowConfidencePrefix} ${result.shortExplanation}`
    : result.shortExplanation;

  return {
    ...result,
    detectedLandmarkId: matchedCandidate?.id ?? null,
    detectedLandmarkName: matchedCandidate?.name ?? null,
    confidence,
    isUncertain,
    shortExplanation,
    nearbyPlaces: result.nearbyPlaces.filter((place) => candidateById.has(place.id)),
  };
}

function buildNoNearbyLandmarksResult(): AiGuideResult {
  return {
    detectedLandmarkId: null,
    detectedLandmarkName: null,
    confidence: 0,
    isUncertain: true,
    shortExplanation: "I could not find known landmarks near your current location, "
      + "so I can’t identify this place confidently from the scan.",
    localGuideStory: "A local guide can still help you understand the area "
      + "and plan a nearby route based on what you want to see next.",
    interestingFacts: [],
    bestTimeToVisit: "Ask a local guide for the best time based on your route and the season.",
    nearbyPlaces: [],
    followUpSuggestions: [
      "Try scanning again closer to the landmark.",
      "Check that location permission is enabled.",
      "Ask for a custom itinerary nearby.",
    ],
    cta: {
      title: "Plan with a local guide",
      message: "No nearby landmark candidates were found. "
        + "A guide can help build a custom route from your current area.",
      action: "custom_itinerary",
    },
  };
}

function buildOpenAiFailureFallback(nearbyLandmarks: NearbyLandmarkCandidate[]): AiGuideResult {
  const nearest = nearbyLandmarks[0] ?? null;
  const nearbyPlaces = nearbyLandmarks.slice(1, 4).map(toNearbyPlace);

  if (!nearest) {
    return buildNoNearbyLandmarksResult();
  }

  return {
    detectedLandmarkId: nearest.id,
    detectedLandmarkName: nearest.name,
    confidence: OPENAI_CONFIDENCE_FALLBACK,
    isUncertain: true,
    shortExplanation: `I’m not fully sure, but based on your location, this may be ${nearest.name}. `
      + "AI image analysis was not completed, so this is based only on nearby landmarks.",
    localGuideStory: nearest.short_description
      ?? "This nearby place may be worth checking, but please confirm from signs "
        + "or with a local guide before relying on the match.",
    interestingFacts: nearest.interesting_facts.slice(0, 3),
    bestTimeToVisit: nearest.best_time_to_visit ?? "Visit during daylight for easier orientation and better photos.",
    nearbyPlaces,
    followUpSuggestions: [
      "Try scanning again with a clearer view.",
      "Move closer to the landmark entrance or main facade.",
      "Ask a guide to confirm this location.",
    ],
    cta: {
      title: "Confirm with a local guide",
      message: "The image AI was unavailable, "
        + "but a guide can quickly confirm the landmark and share the right story.",
      action: "book_private_guide",
    },
  };
}

async function saveScanHistory(
  supabase: ReturnType<typeof createClient>,
  payload: {
    imageUrl: string;
    latitude: number;
    longitude: number;
    result: AiGuideResult;
  },
): Promise<void> {
  const { error } = await supabase.from("scan_history").insert({
    image_url: payload.imageUrl,
    latitude: payload.latitude,
    longitude: payload.longitude,
    detected_landmark_id: payload.result.detectedLandmarkId,
    confidence: payload.result.confidence,
    ai_response: payload.result,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to save scan history", error);
    throw new HttpError(500, "scan_history_insert_failed", "Could not save scan history.");
  }
}

function toOpenAiLandmarkCandidate(candidate: NearbyLandmarkCandidate): NearbyLandmarkCandidate {
  return {
    id: candidate.id,
    name: candidate.name,
    category: candidate.category,
    short_description: candidate.short_description,
    full_story: candidate.full_story,
    interesting_facts: candidate.interesting_facts,
    historical_context: candidate.historical_context,
    best_time_to_visit: candidate.best_time_to_visit,
    average_visit_duration: candidate.average_visit_duration,
    distance_meters: candidate.distance_meters,
  };
}

function toNearbyPlace(candidate: NearbyLandmarkCandidate): NearbyPlace {
  return {
    id: candidate.id,
    name: candidate.name,
    distanceMeters: candidate.distance_meters,
  };
}

function handleServerError(error: unknown): Response {
  if (error instanceof HttpError) {
    const status = error.status >= 500 ? 500 : error.status;
    const message = error.status >= 500 ? "The scan could not be processed right now." : error.message;
    return jsonResponse({ error: message, code: error.code }, status);
  }

  console.error("Unexpected analyze-scan failure", error);
  return jsonResponse({ error: "The scan could not be processed right now.", code: "unexpected_error" }, 500);
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readNullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : readString(value);
}

function requireString(value: unknown, fieldName: string): string {
  const text = readString(value);

  if (!text) {
    throw new Error(`AI result is missing ${fieldName}.`);
  }

  return text;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string =>
    typeof item === "string" && item.trim().length > 0
  );
}

function readNearbyPlaces(value: unknown): NearbyPlace[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = readString(item.id);
      const name = readString(item.name);
      const distanceMeters = readNumber(item.distanceMeters, NaN);

      if (!id || !name || !Number.isFinite(distanceMeters)) {
        return null;
      }

      return { id, name, distanceMeters };
    })
    .filter((item): item is NearbyPlace => item !== null);
}

function readCtaAction(value: unknown): CtaAction {
  if (value === "whatsapp" || value === "book_private_guide" || value === "custom_itinerary") {
    return value;
  }

  throw new Error("AI result has an invalid CTA action.");
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}
