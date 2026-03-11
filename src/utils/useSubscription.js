// utils/useSubscription.js
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const FOUNDING_MEMBER_LIMIT = 200;
const FOUNDER_EMAIL = "4ddiej03@gmail.com"; // Only you get the Founder badge

export function useSubscription(user) {
  const [isPro, setIsPro]             = useState(false);
  const [isFounder, setIsFounder]     = useState(false);
  const [memberNumber, setMemberNumber] = useState(null);
  const [aiCallsUsed, setAiCallsUsed] = useState(0);
  const [loading, setLoading]         = useState(true);
  const FREE_AI_LIMIT                 = 10;

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function check() {
      try {
        const { data } = await supabase
          .from("user_data")
          .select("is_pro, ai_calls_used, created_at")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setIsPro(data.is_pro || false);
          setAiCallsUsed(data.ai_calls_used || 0);
        }

        // Count users who signed up before this one (their member number)
        const { count } = await supabase
          .from("user_data")
          .select("*", { count: "exact", head: true })
          .lte("created_at", data?.created_at || new Date().toISOString());

        const number = count || 1;
        setMemberNumber(number);

        // Only YOU get the Founder badge
        if (user.email === FOUNDER_EMAIL) {
          setIsFounder(true);
          setIsPro(true);
        // First 200 users get Pioneer badge + Pro free
        } else if (number <= FOUNDING_MEMBER_LIMIT) {
          setIsPro(true);
        }

      } catch (err) {
        console.error("Subscription check failed:", err);
      }
      setLoading(false);
    }
    check();
  }, [user]);

  async function incrementAiCalls() {
    if (!user) return;
    const next = aiCallsUsed + 1;
    setAiCallsUsed(next);
    await supabase
      .from("user_data")
      .update({ ai_calls_used: next })
      .eq("user_id", user.id);
  }

  const isPioneer  = !isFounder && memberNumber !== null && memberNumber <= FOUNDING_MEMBER_LIMIT;
  const canUseAI   = isPro || aiCallsUsed < FREE_AI_LIMIT;
  const callsLeft  = Math.max(0, FREE_AI_LIMIT - aiCallsUsed);

  return {
    isPro, isFounder, isPioneer, memberNumber,
    canUseAI, callsLeft, aiCallsUsed,
    FREE_AI_LIMIT, loading, incrementAiCalls,
  };
}
