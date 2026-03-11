// api/stripe-webhook.js — handles Stripe events
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase  = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => { data += chunk; });
    req.on("end", () => resolve(Buffer.from(data)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig     = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const session = event.data.object;

  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;
    if (userId) {
      await supabase.from("user_data").upsert({
        user_id: userId,
        is_pro: true,
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const { data } = await supabase
      .from("user_data")
      .select("user_id")
      .eq("stripe_customer_id", session.customer)
      .single();
    if (data?.user_id) {
      await supabase.from("user_data").update({
        is_pro: false,
        updated_at: new Date().toISOString(),
      }).eq("user_id", data.user_id);
    }
  }

  res.status(200).json({ received: true });
}
