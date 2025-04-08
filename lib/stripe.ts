import { MembershipStatus } from "@/hooks/use-membership";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
  appInfo: {
    name: "Prompt Manager",
    version: "0.1.0"
  }
});

// Helper function to determine membership status based on Stripe subscription status
export const getMembershipStatusFromSubscription = (status: Stripe.Subscription.Status): MembershipStatus => {
  switch (status) {
    case "active":
    case "trialing":
      // Active or trialing subscriptions map to 'pro'
      return "pro"; // Assuming 'pro' is the active paid status
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "paused":
    case "unpaid":
      // All other non-active statuses map to 'free'
      return "free";
    default:
      // Default to 'free' for any unknown status
      return "free";
  }
};
