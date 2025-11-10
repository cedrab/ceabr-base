"use client";

import { useEffect, useState } from "react";

export default function QuizFromPDF() {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQuiz = async () => {
      const text = sessionStorage.getItem("pdf_text");
      if (!text) return alert("Aucun texte PDF trouvé. Retourne à l’upload.");
      setLoading(true);

      const res = await fetch("/api/ai/pdf-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setQuiz(data);
      setLoading(false);
    };

    generateQuiz();
  }, []);

  if (loading) return <p className="text-white p-10">Génération du quiz...</p>;

  return (
    <div className="min-h-screen bg-[#141a26] text-white p-10">
      <h1 className="text-3xl font-bold mb-6 text-center">🧠 Quiz IA sur ton PDF</h1>
      {quiz.length === 0 ? (
        <p className="text-center text-gray-400">Aucune question générée.</p>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          {quiz.map((q, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg">
              <p className="font-semibold mb-2">{q.question}</p>
              <ul className="list-disc ml-6 text-gray-300">
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
