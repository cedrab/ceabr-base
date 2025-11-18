"use client";

import { useState } from "react";

export default function DroplyHome() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  async function handleUpload() {
    if (!file) return alert("Choisis un fichier.");

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    if (password.trim() !== "") form.append("password", password);

    const res = await fetch("/api/droply/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erreur upload");
      setLoading(false);
      return;
    }

    setDownloadLink(data.link);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#141a26] text-white flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-6">📤 Droply – Partage instantané</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">

        {/* FILE INPUT */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full"
        />

        {/* PASSWORD INPUT */}
        <input
          type="text"
          placeholder="Mot de passe (optionnel)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 w-full rounded bg-gray-700 text-white border border-gray-600"
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`w-full py-2 rounded font-semibold ${
            loading || !file
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Upload en cours..." : "Uploader 🔼"}
        </button>

        {downloadLink && (
          <div className="mt-6 p-4 bg-gray-700 rounded">
            <p className="mb-2 text-center text-green-400">Lien créé :</p>
            <a
              href={downloadLink}
              className="text-blue-400 underline break-all text-center block"
              target="_blank"
            >
              {downloadLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
