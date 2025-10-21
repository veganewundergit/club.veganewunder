import { NextResponse } from 'next/server';
import type { ResponseCreateParams } from 'openai/resources/responses/responses';
import { getOpenAIClient } from '@/lib/openai';
import { normalizeFromApi, SHOPPING_SECTIONS, groupByCategory } from '@/lib/shopping';

const MAX_FILE_SIZE_MB = 10;
const SYSTEM_PROMPT = `
Du bist ein Assistent, der Zutaten aus Rezeptbildern extrahiert.
Analysiere das Bild und gib ausschließlich JSON zurück – keine Erklärungen, keine Markdown-Codeblöcke.
Verwende exakt diese Struktur:
{
  "Obst & Gemüse": ["..."],
  "Trockenware": ["..."],
  "Kühlregal": ["..."],
  "Tiefkühl": ["..."],
  "Sonstiges": ["..."]
}
Nur Zutaten-Auflistungen, keine Zubereitungsschritte. Keine leeren Strings, keine Duplikate.
`;

export const runtime = 'nodejs';

function extractJsonBlock(content: string) {
  const match = content.match(/\{[\s\S]*\}/);
  return match ? match[0] : content;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('image');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Bilddatei ist erforderlich.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Bitte lade nur Bilddateien hoch.' }, { status: 400 });
  }

  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `Datei ist zu groß. Maximal ${MAX_FILE_SIZE_MB} MB.` }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || 'image/jpeg';
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  let client;
  try {
    client = getOpenAIClient();
  } catch (error) {
    console.error('OPENAI_API_KEY fehlt.', error);
    return NextResponse.json({ error: 'OPENAI_API_KEY ist nicht konfiguriert.' }, { status: 500 });
  }

  try {
    const input: ResponseCreateParams['input'] = [
      {
        role: 'system',
        content: [{ type: 'input_text', text: SYSTEM_PROMPT }]
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Analysiere dieses Rezeptbild und extrahiere die Zutaten.'
          },
          {
            type: 'input_image',
            image_url: dataUrl,
            detail: 'high'
          }
        ]
      }
    ];

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input
    });

    const rawOutput = response.output_text ?? '';
    if (!rawOutput) {
      return NextResponse.json({ error: 'Keine Antwort vom Modell erhalten.' }, { status: 502 });
    }

    let parsed;

    try {
      parsed = JSON.parse(extractJsonBlock(rawOutput));
    } catch (error) {
      console.error('Antwort konnte nicht geparst werden', rawOutput, error);
      return NextResponse.json(
        {
          error: 'Konnte keine Zutaten extrahieren. Bitte anderes Bild probieren.'
        },
        { status: 422 }
      );
    }

    const normalizedItems = normalizeFromApi(parsed);

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        {
          error: 'Keine Zutaten gefunden. Stelle sicher, dass das Bild die Zutatenliste gut lesbar zeigt.'
        },
        { status: 422 }
      );
    }

    const grouped = groupByCategory(normalizedItems);

    const responseBody = SHOPPING_SECTIONS.reduce<Record<string, string[]>>((acc, section) => {
      acc[section] = grouped[section].map((item) => item.name);
      return acc;
    }, {});

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error('Fehler bei der OpenAI-Anfrage', error);
    return NextResponse.json(
      { error: 'Beim Generieren der Einkaufsliste ist ein Fehler aufgetreten.' },
      { status: 500 }
    );
  }
}
