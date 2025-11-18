import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/droply/supabase";

export async function POST(req: NextRequest) {
  try {
    const { signedUrl, fileName } = await req.json();

    if (!signedUrl || !fileName) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Télécharger le fichier depuis Supabase
    const fileResponse = await fetch(signedUrl);

    if (!fileResponse.ok) {
      return NextResponse.json({ error: "Impossible de récupérer le fichier" }, { status: 500 });
    }

    const blob = await fileResponse.blob();

    // Forcer le téléchargement dans le navigateur
    return new NextResponse(blob, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": fileResponse.headers.get("Content-Type") || "application/octet-stream",
      },
    });
  } catch (err) {
    console.error("Download error :", err);
    return NextResponse.json({ error: "Erreur interne serveur" }, { status: 500 });
  }
}
