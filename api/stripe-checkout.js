// api/stripe-checkout.js — creates a Stripe checkout session
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PRICE_ID = "price_1T9wl5RkZ3rQ2XvFC0Bj6a11";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, email } = req.body;
  if (!userId || !email) return res.status(400).json({ error: "Missing userId or email" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer_email: email,
      metadata: { userId },
      success_url: `${process.env.VITE_APP_URL || "https://che-af.vercel.app"}?subscribed=true`,
      cancel_url:  `${process.env.VITE_APP_URL || "https://che-af.vercel.app"}?cancelled=true`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
