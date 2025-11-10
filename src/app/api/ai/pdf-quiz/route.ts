import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const prompt = `Analyse le texte suivant et génère 5 questions de quiz à choix multiple avec les réponses exactes :
Texte : """${text.slice(0, 8000)}"""
Format JSON :
[
  {"question": "...", "choices": ["A", "B", "C", "D"], "answer": "B"},
  ...
]`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const textResponse = await res.text();
    let data;

    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      console.error("⚠️ Réponse non JSON détectée :", textResponse);
      throw new Error("Réponse OpenAI invalide : " + textResponse.slice(0, 200));
    }

    const raw = data.choices?.[0]?.message?.content || "[]";

    // 🧠 Nettoyage du texte renvoyé par OpenAI
    const cleaned = raw
      .replace(/^[^{\[]*/, "")  // supprime tout avant le premier { ou [
      .replace(/[^}\]]*$/, ""); // supprime tout après le dernier } ou ]

    let quiz;
    try {
      quiz = JSON.parse(cleaned);
    } catch (e) {
      console.warn("⚠️ Impossible de parser le JSON brut :", raw);
      quiz = [];
    }

    return NextResponse.json(quiz);
  } catch (err: any) {
    console.error("Erreur quiz PDF:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
