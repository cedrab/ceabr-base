"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    });

    if (error) setMessage("❌ " + error.message);
    else setMessage("✅ Email envoyé ! Clique sur le lien pour te connecter.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Créer un compte 🧑‍💻</h1>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-md text-black"
            required
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold"
          >
            Recevoir le lien magique
          </button>
        </form>

        {message && <p className="mt-3 text-center text-sm">{message}</p>}

        <p className="mt-4 text-center text-gray-400 text-sm">
          Déjà un compte ?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
