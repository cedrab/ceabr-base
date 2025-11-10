import { NextResponse } from "next/server";
import * as pdfParse from "pdf-parse"; // ✅ compatible Node pur

export const runtime = "nodejs"; // 👈 obligatoire pour autoriser fs/FileReader

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    // Convertir en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extraction du texte
    const parsed = await (pdfParse as any)(buffer);

    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json({ error: "Aucun texte détecté dans le PDF." }, { status: 400 });
    }

    return NextResponse.json({ text: parsed.text });
  } catch (err: any) {
    console.error("❌ Erreur API upload :", err);
    return NextResponse.json({ error: "Erreur interne serveur PDF" }, { status: 500 });
  }
}
