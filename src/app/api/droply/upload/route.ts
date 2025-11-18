import { NextResponse } from "next/server";
import { supabase } from "@/lib/droply/supabase";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const password = form.get("password") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ID unique du lien
    const fileId = crypto.randomBytes(6).toString("hex");

    // Nom de fichier sécurisé
    const safeName = file.name.replace(/\s+/g, "_");

    // Chemin dans le bucket
    const storagePath = `${fileId}/${safeName}`;

    // Upload dans Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("uploads_droply")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      console.error("UPLOAD ERR:", uploadError);
      return NextResponse.json(
        { error: "Erreur upload fichier" },
        { status: 500 }
      );
    }

    // Hash mot de passe (SHA-256)
    let password_hash = null;
    if (password) {
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(password)
      );
      password_hash = Buffer.from(hashBuffer).toString("hex");
    }

    // INSERT DATABASE
    const { error: insertError } = await supabase
      .from("droply_files")
      .insert({
        id: fileId,
        file_name: safeName,
        storage_path: storagePath,
        password_hash: password_hash,
      });

    if (insertError) {
      console.error("DB ERR:", insertError);
      return NextResponse.json(
        { error: "Erreur enregistrement DB" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      link: `/droply/d/${fileId}`,
      protected: !!password,
    });

  } catch (err) {
    console.error("❌ ERR UPLOAD :", err);
    return NextResponse.json(
      { error: "Erreur interne serveur" },
      { status: 500 }
    );
  }
}
