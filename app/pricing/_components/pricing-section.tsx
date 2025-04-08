"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Check } from "lucide-react";
import Link from "next/link";

// Get the subscription link from env
const subscriptionLink = process.env.NEXT_PUBLIC_MONTHLY_SUBSCRIPTION_LINK;

export const PricingSection = () => {
  const { userId } = useAuth();

  // Add client reference ID to subscription link if user is logged in
  const finalSubscriptionLink = userId && subscriptionLink ? `${subscriptionLink}?client_reference_id=${userId}` : "#";

  // Render different button based on auth state
  const renderProButton = () => {
    if (!userId) {
      return (
        <SignInButton mode="modal">
          <Button
            variant="secondary"
            className="w-full"
          >
            Sign in to upgrade
          </Button>
        </SignInButton>
      );
    }

    return (
      <Button
        asChild
        variant="secondary"
        className="w-full"
      >
        <a
          href={finalSubscriptionLink}
          className={finalSubscriptionLink === "#" ? "pointer-events-none opacity-50" : ""}
        >
          Upgrade to Pro
        </a>
      </Button>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      {/* Free Plan */}
      <Card className="p-8">
        <div className="flex flex-col h-full">
          <div>
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-muted-foreground mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>
          <div className="flex-grow space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Up to 3 prompts</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Basic prompt management</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Community support</span>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </Card>

      {/* Pro Plan */}
      <Card className="p-8 bg-primary text-primary-foreground">
        <div className="flex flex-col h-full">
          <div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-primary-foreground/80 mb-6">For power users</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$10</span>
              <span className="text-primary-foreground/80">/month</span>
            </div>
          </div>
          <div className="flex-grow space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Unlimited prompts</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Advanced prompt management</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Early access to new features</span>
            </div>
          </div>
          {renderProButton()}
        </div>
      </Card>
    </div>
  );
};
