"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function StudyHeroDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPlan = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      console.log("👤 Utilisateur connecté :", currentUser.id);

      // 🔍 Récupère le plan actif le plus récent
      const { data: billingData, error } = await supabase
        .from("billing")
        .select("plan_name, status, created_at")
        .eq("user_id", currentUser.id)
        .eq("app_name", "studyhero")
        .order("created_at", { ascending: false })
        .limit(1);

      console.log("📦 Données billing reçues :", billingData, error);

      if (error) console.error("❌ Erreur récupération plan:", error);

      if (billingData && billingData.length > 0) {
        const planInfo = billingData[0];
        if (planInfo.status === "active") {
          setPlan(planInfo.plan_name);
        } else {
          setPlan("free");
        }
      } else {
        setPlan("free");
      }

      setLoading(false);
    };

    fetchUserAndPlan();
  }, []);

  if (loading) return <p className="text-white p-10">Chargement...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#141a26] text-white">
      <h1 className="text-3xl font-bold mb-4">🎓 StudyHero Dashboard</h1>
      {user && <p className="mb-4 text-gray-300">Email : {user.email}</p>}

      <div className="mt-6 bg-gray-800 px-6 py-6 rounded-lg shadow-md text-center w-full max-w-lg">
        {plan === "pro" ? (
          <>
            <p className="text-green-400 font-semibold mb-2">🌟 Version PRO active</p>
            <p className="text-sm text-gray-300 mb-6">
              Tu bénéficies de toutes les fonctionnalités avancées : quiz IA, synthèses automatiques et export PDF.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/studyhero/upload")}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md font-semibold"
              >
                📚 Importer un PDF de cours
              </button>

              <button
                onClick={() => router.push("/studyhero/quiz")}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md font-semibold"
              >
                🎯 Créer un quiz IA
              </button>

              <button
                onClick={() => router.push("/studyhero/summary")}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold"
              >
                🧾 Générer une synthèse
              </button>

              <button
                onClick={() => alert("Portail Stripe à venir 🚀")}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold"
              >
                💳 Gérer mon abonnement
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-300 mb-2">🚀 Tu es sur la version gratuite</p>
            <p className="text-sm text-gray-400 mb-4">
              Passe en version PRO pour débloquer les quiz IA et les synthèses PDF.
            </p>
            <button
              onClick={async () => {
                const res = await fetch("/api/stripe/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    user_id: user.id,
                    price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
                    app_name: "studyhero",
                  }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold"
            >
              Passer en version Pro
            </button>
          </>
        )}
      </div>
    </div>
  );
}
