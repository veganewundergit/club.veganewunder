import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPT =
  'Extrahiere alle Zutaten aus dem Bild und gib sie als strukturierte JSON-Liste zurück. Gruppiere sie in Supermarkt-Sektionen: Obst & Gemüse, Trockenware, Kühlregal, Tiefkühl, Sonstiges.';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured.' },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('image');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Bilddatei ist erforderlich.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || 'image/jpeg';
  const base64Image = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: PROMPT },
            { type: 'input_image', image_url: dataUrl }
          ]
        }
      ]
    });

    const rawOutput = response.output_text ?? '';

    if (!rawOutput) {
      return NextResponse.json({ error: 'Keine Antwort vom Modell erhalten.' }, { status: 500 });
    }

    let parsed;

    try {
      const match = rawOutput.match(/\{[\s\S]*\}/);
      const jsonPayload = match ? match[0] : rawOutput;
      parsed = JSON.parse(jsonPayload);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Antwort konnte nicht als JSON interpretiert werden.',
          raw: rawOutput
        },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Fehler bei der OpenAI-Anfrage', error);
    return NextResponse.json(
      { error: 'Beim Generieren der Einkaufsliste ist ein Fehler aufgetreten.' },
      { status: 500 }
    );
  }
}
