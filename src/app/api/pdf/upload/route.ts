import { NextResponse } from "next/server";
import { parsePDF } from "@/lib/pdf-parser";

export const runtime = "nodejs"; // nécessaire pour pdf-parse

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    // Convertir le PDF reçu en Buffer Node.js
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extraction du texte via fichier lib/pdf-parser.ts
    const result = await parsePDF(buffer);

    if (!result.text || result.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Aucun texte détecté dans le PDF." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: result.text });
  } catch (err) {
    console.error("❌ Erreur API upload :", err);
    return NextResponse.json(
        { error: "Erreur interne serveur PDF" },
        { status: 500 }
    );
  }
}
