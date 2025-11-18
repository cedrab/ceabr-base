import { NextResponse } from "next/server";
import { supabase } from "@/lib/droply/supabase";

export async function POST(req: Request) {
  try {
    const { id, password } = await req.json();

    // Vérifier les métadonnées
    const { data, error } = await supabase
      .from("droply_files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });

    // Si un mot de passe existe → vérifier
    if (data.password_hash) {
      // Pas de password → authRequired
      if (!password) {
        return NextResponse.json(
          { authRequired: true },
          { status: 401 }
        );
      }

      const encoder = new TextEncoder();
      const inputHash = Buffer.from(
        await crypto.subtle.digest("SHA-256", encoder.encode(password))
      ).toString("hex");

      // Mauvais mot de passe
      if (inputHash !== data.password_hash) {
        return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 403 });
      }
    }

    // Mot de passe OK → générer un lien signé
    const { data: signed } = await supabase.storage
      .from("uploads_droply")
      .createSignedUrl(`${data.id}/${data.file_name}`, 60 * 60); // 1h

    return NextResponse.json({
      file_name: data.file_name,
      signedUrl: signed?.signedUrl || null,
    });
  } catch (err) {
    console.error("ERR DOWNLOAD :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
