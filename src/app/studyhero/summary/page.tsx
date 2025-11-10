"use client";

import { useState } from "react";

export default function SummaryPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    const res = await fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setSummary(data.summary);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#141a26] text-white p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">📝 Générateur de Synthèse IA</h1>

      <textarea
        className="w-full max-w-2xl p-3 rounded-md text-black mb-4"
        placeholder="Colle ici ton texte..."
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={generateSummary}
        disabled={!text || loading}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md"
      >
        {loading ? "Analyse..." : "Générer la synthèse"}
      </button>

      {summary && (
        <div className="mt-8 bg-gray-800 p-4 rounded-lg w-full max-w-2xl">
          <h2 className="font-semibold mb-2">🧾 Résumé :</h2>
          <p className="text-gray-300 whitespace-pre-line">{summary}</p>
        </div>
      )}
    </div>
  );
}
