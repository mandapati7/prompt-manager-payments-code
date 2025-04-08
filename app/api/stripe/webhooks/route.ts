import { manageSubscriptionStatusChange, upsertStripeCustomer } from "@/actions/stripe-actions";
import { getMembershipStatusFromSubscription, stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

const relevantEvents = new Set(["checkout.session.completed", "customer.subscription.updated", "customer.subscription.deleted"]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      console.error("Webhook Error: Missing Stripe signature or secret");
      return new Response("Webhook Error: Configuration issue", { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`, err);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type}`);

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          // These events contain the subscription object directly
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`Handling subscription update/delete for subscription: ${subscription.id}`);
          await handleSubscriptionChange(subscription.id, subscription.customer as string);
          break;

        case "checkout.session.completed":
          // This event contains the checkout session object
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          console.log(`Handling checkout session completion for session: ${checkoutSession.id}`);
          await handleCheckoutSession(checkoutSession);
          break;

        default:
          // Should not happen due to relevantEvents check, but good practice
          console.warn(`Unhandled relevant event type: ${event.type}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error during webhook processing";
      console.error(`Webhook handler failed for event ${event.type}: ${message}`, error);
      // Return a generic error to avoid leaking implementation details
      return new Response("Webhook handler failed", { status: 500 });
    }
  } else {
    console.log(`Ignoring irrelevant Stripe event: ${event.type}`);
  }

  // Acknowledge receipt of the event to Stripe
  return new Response(JSON.stringify({ received: true }));
}

// Handles subscription updates and deletions
async function handleSubscriptionChange(subscriptionId: string, customerId: string) {
  // Simply call the action to manage the status change
  await manageSubscriptionStatusChange(subscriptionId, customerId);
}

// Handles the completion of a checkout session (likely for new subscriptions)
async function handleCheckoutSession(checkoutSession: Stripe.Checkout.Session) {
  // Ensure it's a subscription mode checkout
  if (checkoutSession.mode !== "subscription") {
    console.log(`Ignoring checkout session ${checkoutSession.id} as it's not in subscription mode.`);
    return;
  }

  const subscriptionId = checkoutSession.subscription as string;
  const userId = checkoutSession.client_reference_id as string; // Your internal user ID
  const customerId = checkoutSession.customer as string; // Stripe Customer ID

  if (!userId) {
    console.error(`Missing client_reference_id (userId) in checkout session: ${checkoutSession.id}. Cannot link to internal user.`);
    // Decide how to handle this - maybe create a customer without a link?
    // For now, we'll throw an error to signal a problem.
    throw new Error("Missing client_reference_id in checkout session");
  }

  if (!subscriptionId) {
    console.error(`Missing subscription ID in checkout session: ${checkoutSession.id}. Cannot process.`);
    throw new Error("Missing subscription ID in checkout session");
  }

  if (!customerId) {
    console.error(`Missing customer ID in checkout session: ${checkoutSession.id}. Cannot process.`);
    throw new Error("Missing customer ID in checkout session");
  }

  try {
    // Fetch the newly created subscription to get its status
    // We need this to determine the initial membership status
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const membershipStatus = getMembershipStatusFromSubscription(subscription.status);

    console.log(`Upserting customer (User ID: ${userId}) from checkout session ${checkoutSession.id} with status ${membershipStatus}`);

    // Call the upsert action with all necessary info
    await upsertStripeCustomer(userId, customerId, subscriptionId, membershipStatus);
  } catch (error) {
    // Catch errors during subscription retrieval or upserting
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to process checkout session ${checkoutSession.id}: ${message}`, error);
    // Re-throw the error to be caught by the main handler
    throw error;
  }
}
