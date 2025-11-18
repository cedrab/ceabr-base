import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }

    // 1️⃣ Télécharger la page + chronométrer
    const start = Date.now();
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Impossible de charger cette URL." },
        { status: 400 }
      );
    }

    const loadTime = Date.now() - start;

    const html = await res.text();

    // Taille HTML (convertie en nombre ≠ string)
    const sizeKb = Number((new Blob([html]).size / 1024).toFixed(1));

    // 2️⃣ Analyse HTML avec Cheerio
    const $ = cheerio.load(html);

    const title = $("title").text() || "";
    const metaDesc = $('meta[name="description"]').attr("content") || "";

    // 3️⃣ Analyse SEO
    const h1 = $("h1").length;
    const h2 = $("h2").length;
    const h3 = $("h3").length;

    const wordCount = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .split(" ").length;

    // 4️⃣ Images et scripts
    const imgCount = $("img").length;
    const scriptCount = $("script").length;

    // 5️⃣ Sécurité
    const https = url.startsWith("https://");
    const insecureLinks = html.includes("http://");

    // 6️⃣ Score SEO (0–100)
    let seo_score = 0;
    if (title.length > 10) seo_score += 20;
    if (metaDesc.length > 30) seo_score += 20;
    if (h1 === 1) seo_score += 20;
    if (wordCount > 300) seo_score += 20;
    if (imgCount < 50) seo_score += 20;

    // 7️⃣ Score Performance (0–100)
    let perf_score = 0;
    if (loadTime < 1500) perf_score += 40;
    if (sizeKb < 600) perf_score += 40;
    if (scriptCount < 20) perf_score += 20;

    // 8️⃣ Score Sécurité (0–100)
    let security_score = 0;
    if (https) security_score += 50;
    if (!insecureLinks) security_score += 50;

    // 9️⃣ Réponse finale
    return NextResponse.json({
      url,
      seo_score,
      perf_score,
      security_score,
      metrics: {
        title,
        metaDesc,
        h1,
        h2,
        h3,
        wordCount,
        imgCount,
        scriptCount,
        sizeKb,
        loadTime,
        https,
      },
    });
  } catch (err) {
    console.error("❌ Erreur scan :", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse du site." },
      { status: 500 }
    );
  }
}
