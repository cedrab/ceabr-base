"use client";

import { useState } from "react";

export default function LinkAuditPage() {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);

  const handleAudit = async () => {
    if (!url) return alert("Entre une URL");

    setLoading(true);
    setRecommendations(null);

    const res = await fetch("/api/linkaudit/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      alert("Erreur : " + data.error);
      return;
    }

    setAudit(data);
  };

  const handleAI = async () => {
    if (!audit) return;

    setLoadingIA(true);

    const res = await fetch("/api/linkaudit/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audit }),
    });

    const data = await res.json();
    setLoadingIA(false);

    if (data.error) {
      alert("Erreur IA : " + data.error);
      return;
    }

    setRecommendations(data.recommendations);
  };

  return (
    <div className="min-h-screen bg-[#141a26] text-white p-10">
      <h1 className="text-3xl font-bold mb-6 text-center">🔗 LinkAudit</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="https://exemple.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-4 py-2 rounded-l-md text-black w-80"
        />
        <button
          onClick={handleAudit}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md font-semibold"
        >
          {loading ? "Analyse..." : "Analyser"}
        </button>
      </div>

      {audit && (
        <div className="bg-gray-800 p-6 rounded-lg max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4">
            Résultats pour : {audit.url}
          </h2>

          <p>SEO : {audit.seo}/100</p>
          <p>Performance : {audit.performance}/100</p>
          <p>Sécurité : {audit.security}/100</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">🔎 Détails</h3>
          <pre className="text-sm bg-gray-900 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(audit.details, null, 2)}
          </pre>

          <button
            onClick={handleAI}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md font-semibold w-full mt-4"
          >
            {loadingIA ? "Analyse IA en cours..." : "💡 Recommandations IA"}
          </button>

          {recommendations && (
            <div className="mt-6 bg-gray-900 p-4 rounded-lg whitespace-pre-wrap">
              <h3 className="text-lg font-bold mb-2">💡 Recommandations IA</h3>
              {recommendations}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
