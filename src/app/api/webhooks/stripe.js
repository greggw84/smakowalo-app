import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

// === KONFIGURACJA ===
// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe wymaga wyłączonego bodyParsera
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;

  try {
    // Weryfikacja podpisu webhooka
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // ✅ Subskrypcja została utworzona
      case "customer.subscription.created": {
        const sub = event.data.object;
        console.log("✅ SUB CREATED:", sub.id);

        await supabase.from("subscriptions").upsert({
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer,
          user_email: sub.customer_email || sub.metadata.email || null,
          plan_key: sub.metadata.plan_key || "default",
          people: sub.metadata.people ? parseInt(sub.metadata.people) : null,
          days: sub.metadata.days ? parseInt(sub.metadata.days) : null,
          status: sub.status,
          amount: sub.items?.data[0]?.price?.unit_amount / 100 || null,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
        });
        break;
      }

      // 🔁 Subskrypcja została zaktualizowana (np. zmiana planu, statusu)
      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log("♻️ SUB UPDATED:", sub.id);

        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            amount: sub.items?.data[0]?.price?.unit_amount / 100 || null,
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      // ❌ Subskrypcja anulowana
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        console.log("🛑 SUB CANCELLED:", sub.id);

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      // 💰 Płatność udana
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("💰 PAYMENT SUCCESS:", invoice.id);

        await supabase.from("payments").insert({
          stripe_invoice_id: invoice.id,
          stripe_customer_id: invoice.customer,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: invoice.status,
          created_at: new Date().toISOString(),
        });
        break;
      }

      // ⚠️ Płatność nieudana
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("⚠️ PAYMENT FAILED:", invoice.id);

        await supabase.from("payments").insert({
          stripe_invoice_id: invoice.id,
          stripe_customer_id: invoice.customer,
          amount: invoice.amount_due / 100,
          currency: invoice.currency,
          status: "failed",
          created_at: new Date().toISOString(),
        });
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
}
