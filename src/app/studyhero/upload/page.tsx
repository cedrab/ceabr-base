"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return alert("Sélectionne un PDF d'abord.");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/pdf/extract", {
        method: "POST",
        body: formData,
      });


      const raw = await res.text(); // ✅ lire la réponse brute
      console.log("📩 Réponse brute :", raw);

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("⚠️ Réponse non JSON :", raw);
        alert("Erreur serveur (500) — vérifie la console.");
        setLoading(false);
        return;
      }

      if (!res.ok || data.error) {
        console.error("❌ Erreur :", data.error);
        alert("Erreur : " + (data.error || "Erreur inconnue"));
        setLoading(false);
        return;
      }

      console.log("✅ Texte extrait :", data.text?.slice(0, 200));
      setText(data.text);
    } catch (error) {
      console.error("⚠️ Erreur upload :", error);
      alert("Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (path: string) => {
    if (!text) return alert("Aucun texte à traiter !");
    sessionStorage.setItem("pdf_text", text);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#141a26] text-white p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">📚 Importer ton cours PDF</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className={`px-6 py-2 rounded-md transition ${
          loading || !file
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Analyse du PDF..." : "Extraire le texte"}
      </button>

      {text && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg w-full max-w-2xl text-gray-300">
          <p className="mb-4">
            ✅ PDF analysé avec succès. Voici un aperçu :
          </p>
          <p className="whitespace-pre-wrap text-sm">
            {text.slice(0, 1000)}...
          </p>

          <div className="flex gap-4 mt-6 justify-center">
            <button
              onClick={() => handleChoice("/studyhero/quiz/from-pdf")}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-md font-semibold"
            >
              🎯 Générer un Quiz IA
            </button>
            <button
              onClick={() => handleChoice("/studyhero/summary/from-pdf")}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md font-semibold"
            >
              🧾 Générer une Synthèse IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
