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
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg']);

type ErrorCode = 'METHOD_NOT_ALLOWED' | 'INVALID_FORM_DATA' | 'MISSING_IMAGE' | 'UNSUPPORTED_IMAGE_TYPE' | 'IMAGE_TOO_LARGE' | 'INVALID_COORDINATES' | 'SERVER_ERROR';

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

function createUncertainResult(nearbyPlaces: AiGuideResult['nearbyPlaces']): AiGuideResult {
  return {
    detectedLandmarkId: null,
    detectedLandmarkName: null,
    confidence: 0,
    isUncertain: true,
    shortExplanation: 'I could not match this scan to a known nearby landmark yet.',
    localGuideStory: 'Try moving closer to a known landmark, keep the landmark centered in the frame, and scan again. This MVP uses nearby trusted landmark data only; AI vision will be added later.',
    interestingFacts: ['The scan photo was uploaded securely to private storage.', 'No OpenAI or external AI provider was called for this result.'],
    bestTimeToVisit: 'Try again in clear daylight or from a spot with an unobstructed view of the landmark.',
    nearbyPlaces,
    followUpSuggestions: ['Move closer to a known landmark', 'Retake the photo with the landmark centered', 'Explore nearby places on the map'],
    cta: {
      title: 'Need help finding it?',
      message: 'A local guide can help identify nearby landmarks and build a custom walking route.',
      action: 'custom_itinerary',
    },
  };
}

function createDetectedResult(landmarks: NearbyLandmarkRow[]): AiGuideResult {
  const nearest = landmarks[0];

  if (!nearest) {
    return createUncertainResult([]);
  }

  const nearbyPlaces = landmarks.slice(0, 5).map((landmark) => ({
    id: landmark.id,
    name: landmark.name,
    distanceMeters: Math.round(landmark.distance_meters),
  }));

  return {
    detectedLandmarkId: nearest.id,
    detectedLandmarkName: nearest.name,
    confidence: 0.78,
    isUncertain: false,
    shortExplanation: nearest.short_description,
    localGuideStory: nearest.full_story,
    interestingFacts: nearest.interesting_facts?.length ? nearest.interesting_facts : ['This result is based on the nearest trusted landmark record.'],
    bestTimeToVisit: nearest.best_time_to_visit,
    nearbyPlaces,
    followUpSuggestions: [`What should I notice first at ${nearest.name}?`, 'What is nearby that tourists often miss?', 'How much time should I spend here?'],
    cta: {
      title: 'Make this a private guided stop',
      message: `Add ${nearest.name} to a custom itinerary with a local guide who can explain the details in context.`,
      action: 'book_private_guide',
    },
  };
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
    const result = createDetectedResult(nearbyLandmarks);
    const nearestLandmark = nearbyLandmarks[0];

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
