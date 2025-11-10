"use client";

import { useEffect, useState } from "react";

export default function SummaryFromPDF() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSummary = async () => {
      const text = sessionStorage.getItem("pdf_text");
      if (!text) return alert("Aucun texte PDF trouvé. Retourne à l’upload.");
      setLoading(true);

      const res = await fetch("/api/ai/pdf-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setSummary(data.summary || "Aucune synthèse générée.");
      setLoading(false);
    };

    generateSummary();
  }, []);

  if (loading) return <p className="text-white p-10">Création de la synthèse...</p>;

  return (
    <div className="min-h-screen bg-[#141a26] text-white p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🧾 Synthèse IA de ton PDF</h1>
      <div className="bg-gray-800 p-6 rounded-lg max-w-3xl whitespace-pre-wrap text-gray-200">
        {summary}
      </div>
    </div>
  );
}
