import { createClient } from "@supabase/supabase-js";

// ⚠️ On utilise bien NEXT_PUBLIC pour la partie client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 📌 C’est EXACTEMENT CE NOM qu’on importe partout
export const supabase = createClient(supabaseUrl, supabaseKey);
