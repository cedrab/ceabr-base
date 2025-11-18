import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { audit } = await req.json();

    if (!audit) {
      return NextResponse.json(
        { error: "Aucune donnée d’audit fournie." },
        { status: 400 }
      );
    }

    const prompt = `
Analyse cet audit de site web et génère :

1. Résumé général
2. Points forts
3. Points faibles
4. Optimisations SEO
5. Optimisations Performance
6. Optimisations Sécurité
7. Plan d’action concret et priorisé
8. Note globale sur 100

AUDIT :
${JSON.stringify(audit, null, 2)}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un expert SEO & Web Performance." },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json({
      recommendations: response.choices[0].message.content,
    });

  } catch (err) {
    console.error("❌ Erreur IA :", err);
    return NextResponse.json(
      { error: "Erreur interne IA" },
      { status: 500 }
    );
  }
}
