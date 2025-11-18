import { promisify } from "util";
import extract from "pdf-text-extract";

const extractAsync = promisify(extract);

export async function parsePDF(buffer: Buffer) {
  try {
    const textArray = await extractAsync(buffer);
    const text = textArray.join("\n");
    return { text };
  } catch (err) {
    console.error("❌ Erreur extraction PDF :", err);
    throw new Error("Impossible d'extraire le texte du PDF.");
  }
}
