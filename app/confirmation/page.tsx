"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Confirmation page shown after successful Stripe subscription
export default function ConfirmationPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Subscription Successful!</h1>
          <p className="text-muted-foreground">Thank you for subscribing!</p>
        </div>

        <Button
          size="lg"
          onClick={() => router.push("/prompts")}
          className="animate-pulse"
        >
          View Prompts
        </Button>
      </motion.div>
    </div>
  );
}
