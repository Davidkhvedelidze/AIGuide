// Model providers behind small interfaces, so the vendor can be swapped without
// touching the functions. The default implementation speaks the OpenAI-compatible
// HTTP API; point LLM_BASE_URL at any provider that implements it.
//
// Required secrets (supabase secrets set ...):
//   LLM_API_KEY, VISION_MODEL, TTS_MODEL, TTS_VOICE
// Optional: LLM_BASE_URL (default https://api.openai.com/v1)

export interface Candidate {
  id: string;
  name: string;
  summary: string;
}

export interface VisionProvider {
  /** Returns the model's raw text; the caller parses and validates it. */
  recognize(imageBase64: string, candidates: Candidate[]): Promise<string>;
}

export interface SpeechProvider {
  synthesize(text: string, locale: string): Promise<Uint8Array>;
}

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing secret ${name}`);
  return value;
}

const baseUrl = () => Deno.env.get('LLM_BASE_URL') ?? 'https://api.openai.com/v1';

export const RECOGNIZE_PROMPT = `You identify landmarks for a tour guide app.
You are given one photo and a list of candidate places near the user.
Choose the candidate shown in the photo, or none.

Rules:
- You may ONLY answer with an id from the candidate list. Never invent an id.
- If the photo does not clearly show one of the candidates, answer with place_id null.
- confidence is your probability (0 to 1) that place_id is correct. Be conservative.
- alternatives: up to two other candidate ids that could also match, most likely first.

Reply with JSON only:
{"place_id": "<id or null>", "confidence": 0.0, "alternatives": ["<id>"]}`;

export const openAiCompatibleVision: VisionProvider = {
  async recognize(imageBase64, candidates) {
    const list = candidates.map((c) => `- ${c.id}: ${c.name}. ${c.summary}`).join('\n');
    const response = await fetch(`${baseUrl()}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('LLM_API_KEY')}` },
      body: JSON.stringify({
        model: env('VISION_MODEL'),
        temperature: 0,
        messages: [
          { role: 'system', content: RECOGNIZE_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Candidates:\n${list}` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Vision provider returned ${response.status}`);
    const data = await response.json();
    return String(data?.choices?.[0]?.message?.content ?? '');
  },
};

export const openAiCompatibleSpeech: SpeechProvider = {
  async synthesize(text) {
    const response = await fetch(`${baseUrl()}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('LLM_API_KEY')}` },
      body: JSON.stringify({ model: env('TTS_MODEL'), voice: env('TTS_VOICE'), input: text, response_format: 'mp3' }),
    });
    if (!response.ok) throw new Error(`Speech provider returned ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  },
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
