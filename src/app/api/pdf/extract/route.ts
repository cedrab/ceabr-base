import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // obligatoire

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Convertir File → Buffer Node.js
async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun PDF reçu" }, { status: 400 });
    }

    const buffer = await fileToBuffer(file);

    // 1️⃣ Upload du PDF chez OpenAI (Files API)
    const uploaded = await openai.files.create({
      purpose: "vision",
      file: new File([new Uint8Array(buffer)], file.name, {
        type: file.type || "application/pdf",
      }),
    });

    console.log("📄 PDF uploadé :", uploaded.id);

    // 2️⃣ Extraction Vision via Responses API (nouvelle API)
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract ALL text from this PDF. Keep structure, titles and sections. No hallucinations."
            },
            {
              type: "input_file",
              file_id: uploaded.id
            }
          ]
        }
      ]
    });

    // 3️⃣ Extraction du texte (robuste, compatible TS)
    let extracted = "";

    // Cas 1 : sortie directe (le plus fréquent)
    if (typeof response.output_text === "string") {
      extracted = response.output_text;
    }

    // Cas 2 : sortie sous forme d’objets
    else if (Array.isArray(response.output)) {
      for (const item of response.output as any[]) {
        if (item.type === "output_text" && typeof item.text === "string") {
          extracted += item.text + "\n";
        }
      }
    }

    extracted = extracted.trim();

    return NextResponse.json({ text: extracted });
  } catch (err) {
    console.error("❌ Erreur Vision PDF :", err);
    return NextResponse.json(
      { error: "Erreur interne serveur PDF" },
      { status: 500 }
    );
  }
}
