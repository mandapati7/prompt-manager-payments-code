import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
  appInfo: {
    name: "Prompt Manager",
    version: "0.1.0"
  }
});
