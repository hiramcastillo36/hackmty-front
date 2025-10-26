import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Texto requerido" }), {
        status: 400,
      });
    }

    const audio = await client.textToSpeech.convert(
      process.env.ELEVENLABS_VOICE_ID,
      {
        text,
        model_id: "eleven_multilingual_v2", // soporta español, inglés, etc.
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      }
    );

    // ElevenLabs devuelve un stream de audio (Uint8Array)
    const buffer = Buffer.from(await audio.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error("Error en ElevenLabs:", err);
    return new Response(JSON.stringify({ error: "Error generando voz" }), {
      status: 500,
    });
  }
}
