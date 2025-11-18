"use client";

import { useEffect, useState } from "react";

export default function DownloadClient({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchData(pass?: string) {
    setErrorMsg("");

    const res = await fetch("/api/droply/download", {
      method: "POST",
      body: JSON.stringify({
        id,
        password: pass || undefined,
      }),
    });

    const json = await res.json();

    if (json.authRequired) {
      setIsProtected(true);
      setLoading(false);
      return;
    }

    if (json.error) {
      setErrorMsg(json.error);
      setIsProtected(true);
      setLoading(false);
      return;
    }

    // Mot de passe correct → on charge les données fichier
    setIsProtected(false);
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <p className="p-10 text-white">Chargement…</p>;

  // Page protégée par mot de passe
  if (isProtected) {
    return (
      <div className="min-h-screen bg-[#141a26] text-white flex flex-col items-center justify-center p-10">
        <h1 className="text-2xl font-bold mb-4">🔒 Fichier protégé</h1>

        {errorMsg && <p className="text-red-400 mb-4">{errorMsg}</p>}

        <input
          type="password"
          placeholder="Mot de passe"
          className="p-2 mb-4 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={() => fetchData(password)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          Déverrouiller
        </button>
      </div>
    );
  }

  // Aucun fichier trouvé
  if (!data) return <p className="p-10 text-red-400">Erreur.</p>;

  // Page de téléchargement
  return (
    <div className="min-h-screen bg-[#141a26] text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-3xl font-bold mb-6">📄 Télécharger le fichier</h1>

      <p className="text-lg mb-4">{data.file_name}</p>

      {/* BOUTON DE TÉLÉCHARGEMENT FORCÉ */}
      <button
        onClick={async () => {
          const res = await fetch("/api/droply/file", {
            method: "POST",
            body: JSON.stringify({
              signedUrl: data.signedUrl,
              fileName: data.file_name,
            }),
          });

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = data.file_name;
          a.click();

          URL.revokeObjectURL(url);
        }}
        className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md font-semibold"
      >
        Télécharger
      </button>
    </div>
  );
}
