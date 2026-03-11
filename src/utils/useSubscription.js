// utils/useSubscription.js
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const FOUNDING_MEMBER_LIMIT = 200;
const FOUNDER_EMAIL = "4ddiej03@gmail.com"; // Only you get the Founder badge

export function useSubscription(user) {
  const [isPro, setIsPro]               = useState(false);
  const [isFounder, setIsFounder]       = useState(false);
  const [memberNumber, setMemberNumber] = useState(null);
  const [aiCallsUsed, setAiCallsUsed]   = useState(0);
  const [loading, setLoading]           = useState(true);
  const FREE_AI_LIMIT                   = 10;

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function check() {
      try {
        // Get or create user_data row
        let { data } = await supabase
          .from("user_data")
          .select("is_pro, ai_calls_used, member_number")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setIsPro(data.is_pro || false);
          setAiCallsUsed(data.ai_calls_used || 0);

          // If member_number not yet assigned, assign next available
          if (!data.member_number) {
            const { count } = await supabase
              .from("user_data")
              .select("*", { count: "exact", head: true })
              .not("member_number", "is", null);

            const nextNumber = (count || 0) + 1;

            await supabase
              .from("user_data")
              .update({ member_number: nextNumber })
              .eq("user_id", user.id);

            setMemberNumber(nextNumber);
          } else {
            setMemberNumber(data.member_number);
          }
        }

        // Only YOU get the Founder badge
        if (user.email === FOUNDER_EMAIL) {
          setIsFounder(true);
          setIsPro(true);
        } else if (memberNumber !== null && memberNumber <= FOUNDING_MEMBER_LIMIT) {
          setIsPro(true);
        }

      } catch (err) {
        console.error("Subscription check failed:", err);
      }
      setLoading(false);
    }
    check();
  }, [user]);

  // Re-check pro status when memberNumber updates
  useEffect(() => {
    if (!user || isFounder) return;
    if (memberNumber !== null && memberNumber <= FOUNDING_MEMBER_LIMIT) {
      setIsPro(true);
    }
  }, [memberNumber]);

  async function incrementAiCalls() {
    if (!user) return;
    const next = aiCallsUsed + 1;
    setAiCallsUsed(next);
    await supabase
      .from("user_data")
      .update({ ai_calls_used: next })
      .eq("user_id", user.id);
  }

  const isPioneer = !isFounder && memberNumber !== null && memberNumber <= FOUNDING_MEMBER_LIMIT;
  const canUseAI  = isPro || aiCallsUsed < FREE_AI_LIMIT;
  const callsLeft = Math.max(0, FREE_AI_LIMIT - aiCallsUsed);

  return {
    isPro, isFounder, isPioneer, memberNumber,
    canUseAI, callsLeft, aiCallsUsed,
    FREE_AI_LIMIT, loading, incrementAiCalls,
  };
}
