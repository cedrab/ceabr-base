"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function QuizPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 🧩 Récupération du quiz depuis localStorage (ou Supabase en fallback)
    const localQuiz = localStorage.getItem("quizData");
    if (localQuiz) {
      setQuiz(JSON.parse(localQuiz));
      return;
    }

    // Si pas de localStorage → tente Supabase
    const fetchQuiz = async () => {
      const { data } = await supabase
        .from("studyhero_docs")
        .select("quiz")
        .eq("id", params.id)
        .single();

      if (data?.quiz) setQuiz(data.quiz);
      else router.push("/studyhero/dashboard");
    };

    fetchQuiz();
  }, [params.id, router]);

  if (!quiz.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Chargement du quiz...
      </div>
    );
  }

  const current = quiz[currentIndex];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // déjà répondu
    setSelectedAnswer(answer);

    if (current.answer?.toLowerCase() === answer.toLowerCase()) {
      setScore((prev) => prev + 1);
    }

    // Passe à la question suivante après un court délai
    setTimeout(() => {
      if (currentIndex + 1 < quiz.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-green-400">🎉 Quiz terminé !</h1>
        <p className="text-lg mb-6">
          Ton score : <span className="font-bold">{score}</span> / {quiz.length}
        </p>
        <button
          onClick={restartQuiz}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Rejouer
        </button>
        <button
          onClick={() => router.push("/studyhero/dashboard")}
          className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg"
        >
          ← Retour aux documents
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-2xl w-full border border-gray-700">
        <h2 className="text-xl font-semibold text-blue-400 mb-4">
          Question {currentIndex + 1} / {quiz.length}
        </h2>
        <p className="text-gray-200 text-lg mb-6">{current.question}</p>

        {current.type === "qcm" && (
          <div className="grid gap-3">
            {current.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className={`px-4 py-2 rounded-lg border transition ${
                  selectedAnswer
                    ? opt === current.answer
                      ? "bg-green-600 border-green-700"
                      : opt === selectedAnswer
                      ? "bg-red-600 border-red-700"
                      : "bg-gray-700 border-gray-600"
                    : "bg-gray-700 hover:bg-gray-600 border-gray-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === "truefalse" && (
          <div className="flex gap-4 mt-4">
            {["Vrai", "Faux"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={`px-6 py-2 rounded-lg border transition ${
                  selectedAnswer
                    ? opt === current.answer
                      ? "bg-green-600 border-green-700"
                      : opt === selectedAnswer
                      ? "bg-red-600 border-red-700"
                      : "bg-gray-700 border-gray-600"
                    : "bg-gray-700 hover:bg-gray-600 border-gray-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === "open" && (
          <div className="mt-4">
            <textarea
              className="w-full p-3 rounded-md text-black"
              placeholder="Ta réponse..."
              disabled={!!selectedAnswer}
              onBlur={() => handleAnswer("open")}
            />
            <p className="text-sm text-gray-400 mt-2">
              (Question ouverte — passe automatiquement après validation)
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-gray-400 text-sm">
        Score actuel : {score} / {quiz.length}
      </div>
    </div>
  );
}
