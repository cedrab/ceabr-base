import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: Request) {
  try {
    const { user_id, app_name } = await req.json();

    // 🔎 Récupère le stripe_customer_id de la table billing
    const { data, error } = await supabase
      .from("billing")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .eq("app_name", app_name)
      .single();

    if (error || !data?.stripe_customer_id) {
      console.error("❌ Erreur récupération customer:", error);
      return NextResponse.json({ error: "Client non trouvé." }, { status: 404 });
    }

    // 💳 Crée la session du Customer Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("⚠️ Erreur Customer Portal:", err.message);
    return new NextResponse(`Erreur Stripe Portal: ${err.message}`, { status: 400 });
  }
}
