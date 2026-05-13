import OpenAI from 'npm:openai';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import type { AiGuideResult, NearbyLandmarkRow } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BUCKET_NAME = 'scan-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_EXPIRES_SECONDS = 10 * 60;
const NEARBY_RADIUS_METERS = 700;
const MAX_AI_CANDIDATES = 8;
const DEFAULT_OPENAI_VISION_MODEL = 'gpt-5.1';
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg']);

type ErrorCode = 'METHOD_NOT_ALLOWED' | 'INVALID_FORM_DATA' | 'MISSING_IMAGE' | 'UNSUPPORTED_IMAGE_TYPE' | 'IMAGE_TOO_LARGE' | 'INVALID_COORDINATES' | 'SERVER_ERROR';

type LandmarkCandidate = Pick<
  NearbyLandmarkRow,
  | 'id'
  | 'name'
  | 'category'
  | 'short_description'
  | 'full_story'
  | 'interesting_facts'
  | 'historical_context'
  | 'best_time_to_visit'
  | 'average_visit_duration'
  | 'distance_meters'
>;

interface AnalyzeImageWithOpenAIParams {
  signedImageUrl: string;
  latitude: number;
  longitude: number;
  locale: string;
  candidates: LandmarkCandidate[];
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(code: ErrorCode, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function safeLocale(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') {
    return 'en';
  }

  const normalized = value.trim().slice(0, 20);
  return normalized || 'en';
}

function toNearbyPlaces(landmarks: NearbyLandmarkRow[]): AiGuideResult['nearbyPlaces'] {
  return landmarks.slice(0, 5).map((landmark) => ({
    id: landmark.id,
    name: landmark.name,
    distanceMeters: Math.round(landmark.distance_meters),
  }));
}

function createNoNearbyLandmarksResult(): AiGuideResult {
  return {
    detectedLandmarkId: null,
    detectedLandmarkName: null,
    confidence: 0,
    isUncertain: true,
    shortExplanation: 'I could not find trusted landmark records near your current location, so I did not run image analysis.',
    localGuideStory: 'Move closer to a known landmark or ask a local guide to build a route for this area. I only identify places from nearby trusted database records.',
    interestingFacts: ['No nearby landmark candidates were available for this scan.', 'Your OpenAI key remains server-side inside the Supabase Edge Function.'],
    bestTimeToVisit: 'Try scanning again when you are closer to a known point of interest and have a clear view.',
    nearbyPlaces: [],
    followUpSuggestions: ['Move closer to a visible landmark', 'Try a wider photo with more context', 'Ask for a custom itinerary in this area'],
    cta: {
      title: 'Want help exploring here?',
      message: 'A local guide can identify places around you and create a custom route even when the app has no nearby match.',
      action: 'custom_itinerary',
    },
  };
}

function createOpenAIFallbackResult(landmarks: NearbyLandmarkRow[]): AiGuideResult {
  const nearest = landmarks[0];
  const nearbyPlaces = toNearbyPlaces(landmarks);

  if (!nearest) {
    return createNoNearbyLandmarksResult();
  }

  return {
    detectedLandmarkId: nearest.id,
    detectedLandmarkName: nearest.name,
    confidence: 0.45,
    isUncertain: true,
    shortExplanation: `I’m not fully sure, but based on your location, this may be... ${nearest.name}. AI vision analysis was not completed.`,
    localGuideStory: nearest.full_story || 'This fallback is based only on the closest trusted landmark record near your GPS location.',
    interestingFacts: nearest.interesting_facts?.length ? nearest.interesting_facts.slice(0, 3) : ['This result is based only on nearby trusted landmark data, not visual confirmation.'],
    bestTimeToVisit: nearest.best_time_to_visit || 'Try again in clear daylight with the landmark centered in the frame.',
    nearbyPlaces,
    followUpSuggestions: [`Retake the photo closer to ${nearest.name}`, 'Try scanning from a clearer angle', 'Ask a local guide to confirm this spot'],
    cta: {
      title: 'Confirm with a local guide',
      message: `AI vision was unavailable, but a guide can confirm whether this is ${nearest.name} and explain it in context.`,
      action: 'book_private_guide',
    },
  };
}

function normalizeLandmarkCandidates(landmarks: NearbyLandmarkRow[]): LandmarkCandidate[] {
  return landmarks.slice(0, MAX_AI_CANDIDATES).map((landmark) => ({
    id: landmark.id,
    name: landmark.name,
    category: landmark.category,
    short_description: landmark.short_description,
    full_story: landmark.full_story,
    interesting_facts: landmark.interesting_facts ?? [],
    historical_context: landmark.historical_context,
    best_time_to_visit: landmark.best_time_to_visit,
    average_visit_duration: landmark.average_visit_duration,
    distance_meters: Math.round(landmark.distance_meters),
  }));
}

function buildSystemPrompt(): string {
  return [
    'You are a friendly local Georgian tour guide for a mobile AI Tour Guide app.',
    'Return only strict JSON matching the provided schema.',
    'Use only the supplied nearby landmark candidates as your source of truth.',
    'Do not invent landmark IDs, names, historical facts, or details that are not present in the candidates.',
    'Do not rely on generic world knowledge as the source of truth.',
    'If the image does not clearly match any supplied candidate, set detectedLandmarkId and detectedLandmarkName to null.',
    'If confidence is below 0.55, set isUncertain to true and begin shortExplanation with: “I’m not fully sure, but based on your location, this may be...”',
    'Keep answers short, useful, accurate, and travel-friendly. English is the default if the requested locale is unsupported.',
  ].join('\n');
}

function buildUserPrompt({ latitude, longitude, locale, candidates }: Omit<AnalyzeImageWithOpenAIParams, 'signedImageUrl'>): string {
  return JSON.stringify(
    {
      task: 'Analyze the scan image and compare it only against these nearby landmark candidates.',
      gpsLocation: { latitude, longitude },
      locale: locale || 'en',
      nearbyLandmarkCandidates: candidates,
      expectedBehavior: {
        candidateLimit: MAX_AI_CANDIDATES,
        sourceOfTruth: 'nearbyLandmarkCandidates',
        noClearMatch: 'Return detectedLandmarkId: null and detectedLandmarkName: null.',
        lowConfidenceThreshold: 0.55,
        lowConfidenceRequiredOpening: 'I’m not fully sure, but based on your location, this may be...',
        nearbyPlaces: 'Use supplied candidates only, sorted by distance.',
      },
    },
    null,
    2,
  );
}

function buildAiGuideResultSchema() {
  return {
    type: 'json_schema',
    name: 'ai_guide_result',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: [
        'detectedLandmarkId',
        'detectedLandmarkName',
        'confidence',
        'isUncertain',
        'shortExplanation',
        'localGuideStory',
        'interestingFacts',
        'bestTimeToVisit',
        'nearbyPlaces',
        'followUpSuggestions',
        'cta',
      ],
      properties: {
        detectedLandmarkId: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        detectedLandmarkName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        confidence: { type: 'number' },
        isUncertain: { type: 'boolean' },
        shortExplanation: { type: 'string' },
        localGuideStory: { type: 'string' },
        interestingFacts: { type: 'array', items: { type: 'string' } },
        bestTimeToVisit: { type: 'string' },
        nearbyPlaces: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'name', 'distanceMeters'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              distanceMeters: { type: 'number' },
            },
          },
        },
        followUpSuggestions: { type: 'array', items: { type: 'string' } },
        cta: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'message', 'action'],
          properties: {
            title: { type: 'string' },
            message: { type: 'string' },
            action: { type: 'string', enum: ['whatsapp', 'book_private_guide', 'custom_itinerary'] },
          },
        },
      },
    },
  } as const;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNearbyPlaces(value: unknown): value is AiGuideResult['nearbyPlaces'] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { name?: unknown }).name === 'string' &&
        typeof (item as { distanceMeters?: unknown }).distanceMeters === 'number',
    )
  );
}

function isAiGuideResult(value: unknown): value is AiGuideResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AiGuideResult>;

  return (
    (typeof candidate.detectedLandmarkId === 'string' || candidate.detectedLandmarkId === null) &&
    (typeof candidate.detectedLandmarkName === 'string' || candidate.detectedLandmarkName === null) &&
    typeof candidate.confidence === 'number' &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 1 &&
    typeof candidate.isUncertain === 'boolean' &&
    typeof candidate.shortExplanation === 'string' &&
    typeof candidate.localGuideStory === 'string' &&
    isStringArray(candidate.interestingFacts) &&
    typeof candidate.bestTimeToVisit === 'string' &&
    isNearbyPlaces(candidate.nearbyPlaces) &&
    isStringArray(candidate.followUpSuggestions) &&
    !!candidate.cta &&
    typeof candidate.cta.title === 'string' &&
    typeof candidate.cta.message === 'string' &&
    (candidate.cta.action === 'whatsapp' || candidate.cta.action === 'book_private_guide' || candidate.cta.action === 'custom_itinerary')
  );
}

function enforceAiResultSafety(result: AiGuideResult, candidates: LandmarkCandidate[]): AiGuideResult {
  const matchedCandidate = candidates.find((candidate) => candidate.id === result.detectedLandmarkId);
  const confidence = Math.min(1, Math.max(0, result.confidence));
  const isUncertain = result.isUncertain || confidence < 0.55;
  const lowConfidencePrefix = 'I’m not fully sure, but based on your location, this may be...';
  const nearbyPlaces = result.nearbyPlaces
    .filter((place) => candidates.some((candidate) => candidate.id === place.id))
    .slice(0, 5)
    .map((place) => ({ ...place, distanceMeters: Math.round(place.distanceMeters) }));

  if (!matchedCandidate) {
    return {
      ...result,
      detectedLandmarkId: null,
      detectedLandmarkName: null,
      confidence,
      isUncertain: true,
      localGuideStory: 'I cannot confidently match this image to one of the trusted nearby landmark records.',
      interestingFacts: [],
      bestTimeToVisit: 'Try again with a clearer view while standing closer to a known landmark.',
      nearbyPlaces,
    };
  }

  return {
    ...result,
    detectedLandmarkName: matchedCandidate.name,
    confidence,
    isUncertain,
    shortExplanation:
      confidence < 0.55 && !result.shortExplanation.startsWith(lowConfidencePrefix)
        ? `${lowConfidencePrefix} ${matchedCandidate.name}. ${result.shortExplanation}`
        : result.shortExplanation,
    localGuideStory: matchedCandidate.full_story,
    interestingFacts: matchedCandidate.interesting_facts?.length ? matchedCandidate.interesting_facts : result.interestingFacts,
    bestTimeToVisit: matchedCandidate.best_time_to_visit,
    nearbyPlaces,
  };
}

async function analyzeImageWithOpenAI(params: AnalyzeImageWithOpenAIParams): Promise<AiGuideResult> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')!,
  });

  const response = await openai.responses.create({
    model: Deno.env.get('OPENAI_VISION_MODEL') || DEFAULT_OPENAI_VISION_MODEL,
    input: [
      {
        role: 'system',
        content: buildSystemPrompt(),
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: buildUserPrompt(params),
          },
          {
            type: 'input_image',
            image_url: params.signedImageUrl,
            detail: 'auto',
          },
        ],
      },
    ],
    text: {
      format: buildAiGuideResultSchema(),
    },
  });

  const parsed = JSON.parse(response.output_text) as unknown;

  if (!isAiGuideResult(parsed)) {
    throw new Error('OpenAI returned JSON that does not match AiGuideResult');
  }

  return enforceAiResultSafety(parsed, params.candidates);
}

async function parseRequestForm(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Only POST requests are supported.', 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('analyze-scan missing required Supabase environment variables');
      return errorResponse('SERVER_ERROR', 'Scan service is not configured correctly.', 500);
    }

    const formData = await parseRequestForm(request);

    if (!formData) {
      return errorResponse('INVALID_FORM_DATA', 'Request must be valid multipart/form-data.', 400);
    }

    const image = formData.get('image');
    const latitude = Number.parseFloat(String(formData.get('latitude') ?? ''));
    const longitude = Number.parseFloat(String(formData.get('longitude') ?? ''));
    const locale = safeLocale(formData.get('locale'));

    if (!(image instanceof File)) {
      return errorResponse('MISSING_IMAGE', 'A scan image file is required.', 400);
    }

    if (!SUPPORTED_IMAGE_TYPES.has(image.type)) {
      return errorResponse('UNSUPPORTED_IMAGE_TYPE', 'Only JPEG scan images are supported.', 415);
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return errorResponse('IMAGE_TOO_LARGE', 'Scan image must be 5MB or smaller.', 413);
    }

    if (!isValidCoordinate(latitude, longitude)) {
      return errorResponse('INVALID_COORDINATES', 'Latitude and longitude must be valid coordinates.', 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const imagePath = `scans/${crypto.randomUUID()}.jpg`;
    const imageBytes = await image.arrayBuffer();
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(imagePath, imageBytes, {
      contentType: image.type,
      upsert: false,
    });

    if (uploadError) {
      console.error('analyze-scan storage upload failed', { message: uploadError.message });
      return errorResponse('SERVER_ERROR', 'We could not store the scan image. Please try again.', 500);
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(imagePath, SIGNED_URL_EXPIRES_SECONDS);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('analyze-scan signed URL creation failed', { message: signedUrlError?.message });
      return errorResponse('SERVER_ERROR', 'We could not prepare the scan image for analysis. Please try again.', 500);
    }

    const { data: landmarks, error: landmarksError } = await supabase.rpc('get_nearby_landmarks', {
      input_lat: latitude,
      input_lng: longitude,
      radius_meters: NEARBY_RADIUS_METERS,
    });

    if (landmarksError) {
      console.error('analyze-scan nearby landmarks RPC failed', { message: landmarksError.message });
      return errorResponse('SERVER_ERROR', 'We could not search nearby landmarks. Please try again.', 500);
    }

    const nearbyLandmarks = (landmarks ?? []) as NearbyLandmarkRow[];
    const nearestLandmark = nearbyLandmarks[0];
    const landmarkCandidates = normalizeLandmarkCandidates(nearbyLandmarks);
    let result: AiGuideResult;

    if (landmarkCandidates.length === 0) {
      result = createNoNearbyLandmarksResult();
    } else {
      try {
        result = await analyzeImageWithOpenAI({
          signedImageUrl: signedUrlData.signedUrl,
          latitude,
          longitude,
          locale,
          candidates: landmarkCandidates,
        });
      } catch (error) {
        console.error('analyze-scan OpenAI vision analysis failed', { message: error instanceof Error ? error.message : 'Unknown OpenAI error' });
        result = createOpenAIFallbackResult(nearbyLandmarks);
      }
    }

    const { error: scanHistoryError } = await supabase.from('scan_history').insert({
      landmark_id: result.detectedLandmarkId,
      scan_source: 'camera',
      latitude,
      longitude,
      distance_meters: nearestLandmark?.distance_meters ?? null,
      image_path: imagePath,
      locale,
      confidence: result.confidence,
      is_uncertain: result.isUncertain,
      result,
      ai_response: result,
    });

    if (scanHistoryError) {
      console.error('analyze-scan scan history insert failed', { message: scanHistoryError.message });
      return errorResponse('SERVER_ERROR', 'We could not save the scan result. Please try again.', 500);
    }

    return jsonResponse(result);
  } catch (error) {
    console.error('analyze-scan unhandled server error', { message: error instanceof Error ? error.message : 'Unknown error' });
    return errorResponse('SERVER_ERROR', 'Something went wrong while analyzing the scan. Please try again.', 500);
  }
});
