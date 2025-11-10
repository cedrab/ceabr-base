import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const prompt = `Génère 5 questions de quiz à choix multiple sur le sujet suivant : ${topic}.
Réponds au format JSON avec :
[
  {"question": "...", "choices": ["A", "B", "C", "D"], "answer": "A"},
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

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    return NextResponse.json(JSON.parse(content));
  } catch (err: any) {
    console.error("Erreur IA Quiz:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
