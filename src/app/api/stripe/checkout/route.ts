import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: Request) {
  try {
    const { user_id, price_id, app_name } = await req.json();

    // ✅ Correction ici : déclaration avant usage
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    // 🧩 Vérifie si le user existe déjà dans Stripe
    const { data: existingBilling } = await supabase
      .from("billing")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .single();

    let customerId = existingBilling?.stripe_customer_id;

    // 🆕 Crée un nouveau client Stripe si besoin
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { 
          supabase_user_id: user_id,
          app_name: app_name || "studyhero"
        },
      });
      customerId = customer.id;

      // Enregistre dans Supabase
      await supabase.from("billing").insert({
        user_id,
        stripe_customer_id: customerId,
        plan_name: "free",
        app_name: app_name || "studyhero",
      });

      console.log("👤 Nouveau client Stripe créé :", customerId);
    }
    console.log("✅ APP_URL =", process.env.APP_URL);
    console.log("✅ NEXT_PUBLIC_APP_URL =", process.env.NEXT_PUBLIC_APP_URL);

    // 💳 Crée la session de paiement
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${appUrl}/success`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        supabase_user_id: user_id,
        app_name: app_name || "studyhero",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Erreur Stripe Checkout :", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
