"use server";

import { db } from "@/db";
import { customers, InsertCustomer } from "@/db/schema/customers-schema";
import { eq } from "drizzle-orm";

export async function createCustomerAction(data: InsertCustomer) {
  try {
    const [newCustomer] = await db.insert(customers).values(data).returning();
    return newCustomer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer");
  }
}

export async function getCustomerByUserIdAction(userId: string) {
  try {
    const customer = await db.select().from(customers).where(eq(customers.userId, userId));
    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer;
  } catch (error) {
    console.error("Error getting customer by user id", error);
    throw new Error("Failed to get customer");
  }
}

export async function updateCustomerByUserIdAction(userId: string, data: Partial<InsertCustomer>) {
  try {
    const [updatedCustomer] = await db.update(customers).set(data).where(eq(customers.userId, userId)).returning();

    if (!updatedCustomer) {
      throw new Error("Customer not found to update");
    }

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error("Failed to update customer");
  }
}

export async function updateCustomerByStripeCustomerIdAction(stripeCustomerId: string, data: Partial<InsertCustomer>) {
  try {
    const [updatedCustomer] = await db.update(customers).set(data).where(eq(customers.stripeCustomerId, stripeCustomerId)).returning();

    if (!updatedCustomer) {
      throw new Error("Customer not found by Stripe customer ID");
    }

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer by stripe customer ID:", error);
    throw new Error("Failed to update customer by Stripe customer ID");
  }
}
