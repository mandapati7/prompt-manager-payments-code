"use client";

import { getCustomerByUserIdAction } from "@/actions/customers-actions";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export type MembershipStatus = "free" | "pro";

export const useMembership = () => {
  const { userId } = useAuth();
  const [membership, setMembership] = useState<MembershipStatus>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      if (!userId) {
        setMembership("free");
        setLoading(false);
        return;
      }

      try {
        const customer = await getCustomerByUserIdAction(userId);
        setMembership(customer[0]?.membership || "free");
      } catch (error) {
        console.error("Error fetching membership status:", error);
        setMembership("free");
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [userId]);

  return {
    membership,
    loading,
    isPro: membership === "pro"
  };
};
