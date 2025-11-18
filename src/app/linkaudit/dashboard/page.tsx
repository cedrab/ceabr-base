"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function LinkAuditDashboard() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAudits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("linkaudit_audits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setAudits(data || []);
      setLoading(false);
    };

    loadAudits();
  }, []);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading)
    return <p className="text-white p-10">Chargement du dashboard...</p>;

  return (
    <div className="min-h-screen bg-[#141a26] text-white p-10">
      <h1 className="text-3xl font-bold mb-6">📊 Mon Dashboard LinkAudit</h1>

      {audits.length === 0 && (
        <p className="text-gray-400">Aucun audit pour le moment.</p>
      )}

      <div className="grid gap-4 max-w-4xl">
        {audits.map((audit) => (
          <div
            key={audit.id}
            className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-2">{audit.url}</h2>

            <div className="flex gap-6 mb-4">
              <p>
                SEO :{" "}
                <span className={scoreColor(audit.seo_score)}>
                  {audit.seo_score}/100
                </span>
              </p>
              <p>
                Performance :{" "}
                <span className={scoreColor(audit.perf_score)}>
                  {audit.perf_score}/100
                </span>
              </p>
              <p>
                Sécurité :{" "}
                <span className={scoreColor(audit.security_score)}>
                  {audit.security_score}/100
                </span>
              </p>
            </div>

            <details className="bg-black/30 p-3 rounded-md text-sm">
              <summary className="cursor-pointer text-blue-300">
                Voir détails techniques
              </summary>
              <pre className="mt-3 whitespace-pre-wrap">
{JSON.stringify(audit.metrics, null, 2)}
              </pre>
            </details>

            <p className="text-gray-400 text-xs mt-3">
              {new Date(audit.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
