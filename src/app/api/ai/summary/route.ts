import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const prompt = `Résume le texte suivant de manière structurée et claire :
"${text}"`;

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
    const content = data.choices?.[0]?.message?.content || "Aucun résumé";
    return NextResponse.json({ summary: content });
  } catch (err: any) {
    console.error("Erreur IA Summary:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
