import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      // Gestion création ou mise à jour d’abonnement
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        const planName =
          subscription.items.data[0].price.nickname ||
          subscription.items.data[0].price.id ||
          "Sans nom";

        // 🧩 Récupère l’ID utilisateur Supabase depuis le metadata
        const supabaseUserId = subscription.metadata?.supabase_user_id || null;

        console.log("🎯 Données subscription :", {
          customer: customerId,
          plan: planName,
          user_id: supabaseUserId,
        });

        console.log("🔑 Test connexion Supabase :", process.env.NEXT_PUBLIC_SUPABASE_URL);
        const { error: testError } = await supabase.from("billing").select("id").limit(1);
        console.log("🧪 Résultat test connexion :", testError);

        // 🔍 Vérifie si une ligne existe déjà
        const { data: existing } = await supabase
          .from("billing")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existing) {
          // 🔁 Met à jour la ligne existante
          await supabase
            .from("billing")
            .update({
              user_id: supabaseUserId,
              stripe_subscription_id: subscription.id,
              plan_name: planName,
              current_period_start: new Date(subscription.current_period_start * 1000),
              current_period_end: new Date(subscription.current_period_end * 1000),
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date(),
            })
            .eq("stripe_customer_id", customerId);

          console.log("✅ Abonnement mis à jour :", subscription.status);
        } else {
          // 🆕 Crée une nouvelle ligne
          await supabase.from("billing").insert({
            user_id: supabaseUserId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            plan_name: planName,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          console.log("🆕 Nouvelle entrée billing créée :", customerId);
        }

        break;
      }

      // Gestion annulation
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        await supabase
          .from("billing")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        console.log("❌ Abonnement annulé :", subscription.id);
        break;
      }

      default:
        console.log(`ℹ️ Événement Stripe ignoré : ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("⚠️ Erreur Webhook Stripe :", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}

export const config = {
  api: { bodyParser: false },
};
