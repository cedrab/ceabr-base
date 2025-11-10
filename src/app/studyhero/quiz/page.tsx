"use client";

import { useState } from "react";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    const res = await fetch("/api/ai/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    setQuiz(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#141a26] text-white p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🧠 Générateur de Quiz IA</h1>

      <input
        type="text"
        placeholder="Ex: Le développement durable"
        className="w-full max-w-md p-3 rounded-md text-black mb-4"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button
        onClick={generateQuiz}
        disabled={!topic || loading}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md"
      >
        {loading ? "Génération..." : "Créer le quiz"}
      </button>

      {quiz.length > 0 && (
        <div className="mt-8 space-y-4 w-full max-w-2xl">
          {quiz.map((q, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg">
              <p className="font-semibold mb-2">{q.question}</p>
              <ul className="list-disc ml-6">
                {q.choices.map((c: string, idx: number) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
              <p className="mt-2 text-green-400">✅ Réponse : {q.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
