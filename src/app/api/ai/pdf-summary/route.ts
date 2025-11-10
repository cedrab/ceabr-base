import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const prompt = `Fais une synthèse claire, structurée et pédagogique du texte suivant :
Texte : """${text.slice(0, 10000)}"""`;

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
    const summary = data.choices?.[0]?.message?.content || "Aucune synthèse générée.";
    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("Erreur synthèse PDF:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
