"use server";

import { createCustomerAction, getCustomerByUserIdAction, updateCustomerByStripeCustomerIdAction } from "@/actions/customers-actions";
import { SelectCustomer } from "@/db/schema/customers-schema";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export type MembershipStatus = SelectCustomer["membership"];

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

// Helper function to retrieve a Stripe subscription
const getSubscription = async (subscriptionId: string) => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method"]
    });
  } catch (error) {
    console.error("Error fetching Stripe subscription:", error);
    throw new Error("Failed to fetch Stripe subscription");
  }
};

// Manages subscription status changes based on webhook events (updated, deleted)
export const manageSubscriptionStatusChange = async (subscriptionId: string, customerId: string): Promise<void> => {
  try {
    if (!subscriptionId || !customerId) {
      throw new Error("Missing required parameters for manageSubscriptionStatusChange");
    }

    // Fetch the subscription from Stripe to get its current status
    const subscription = await getSubscription(subscriptionId);
    const membershipStatus = getMembershipStatusFromSubscription(subscription.status);

    // Update the customer record in our DB based on Stripe customer ID
    const updateResult = await updateCustomerByStripeCustomerIdAction(customerId, {
      stripeSubscriptionId: subscription.id,
      membership: membershipStatus,
      updatedAt: new Date() // Update the timestamp
    });

    if (!updateResult) {
      // This might happen if the customer ID from Stripe doesn't match any record
      console.warn(`Customer not found for Stripe customer ID during status change: ${customerId}`);
      // Depending on requirements, you might want to throw an error or handle this differently
      // For now, we'll just log a warning
    }

    console.log(`Successfully updated membership status to ${membershipStatus} for customer ${customerId}`);
  } catch (error) {
    console.error("Error in manageSubscriptionStatusChange:", error);
    // Rethrow a generic error to the webhook handler
    throw new Error("Failed to update subscription status");
  }
};

// Creates a new customer or updates an existing one based on Stripe checkout completion
export const upsertStripeCustomer = async (
  userId: string,
  customerId: string, // Stripe Customer ID
  subscriptionId: string,
  membershipStatus: MembershipStatus // Pre-calculated status from webhook handler
): Promise<void> => {
  try {
    if (!userId || !customerId || !subscriptionId || !membershipStatus) {
      throw new Error("Missing required parameters for upsertStripeCustomer");
    }

    // Check if a customer with this userId already exists in our database
    const existingCustomers = await getCustomerByUserIdAction(userId);

    const customerData = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      membership: membershipStatus,
      updatedAt: new Date()
    };

    if (existingCustomers && existingCustomers.length > 0) {
      // Customer exists - update their record using their Stripe Customer ID
      // Note: We assume the userId uniquely identifies the customer in our system,
      // but we use the stripeCustomerId for the update operation here,
      // assuming it's the primary key for updates originating from Stripe events.
      // This might need adjustment based on your exact schema and constraints.
      // If a user could potentially have multiple Stripe Customer IDs (unlikely but possible),
      // using userId for the update might be safer. Let's stick to stripeCustomerId for now.
      console.log(`Updating existing customer (User ID: ${userId}, Stripe ID: ${customerId})`);
      await updateCustomerByStripeCustomerIdAction(customerId, customerData);
    } else {
      // Customer doesn't exist - create a new record
      console.log(`Creating new customer (User ID: ${userId}, Stripe ID: ${customerId})`);
      await createCustomerAction({
        userId,
        ...customerData,
        createdAt: new Date() // Set createdAt only for new customers
      });
    }
    console.log(`Successfully upserted customer (User ID: ${userId}) with membership ${membershipStatus}`);
  } catch (error) {
    console.error("Error in upsertStripeCustomer:", error);
    // Rethrow a generic error
    throw new Error("Failed to create or update customer from Stripe event");
  }
};
