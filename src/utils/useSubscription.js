// utils/useSubscription.js
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const FOUNDING_MEMBER_LIMIT = 200;
const FOUNDER_EMAIL = "4ddiej03@gmail.com";

export function useSubscription(user) {
  const [isPro, setIsPro]               = useState(false);
  const [isFounder, setIsFounder]       = useState(false);
  const [isPioneer, setIsPioneer]       = useState(false);
  const [memberNumber, setMemberNumber] = useState(null);
  const [aiCallsUsed, setAiCallsUsed]   = useState(0);
  const [loading, setLoading]           = useState(true);
  const FREE_AI_LIMIT                   = 10;

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function check() {
      try {
        await supabase
          .from("user_data")
          .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

        const { data, error } = await supabase
          .from("user_data")
          .select("is_pro, ai_calls_used, member_number")
          .eq("user_id", user.id)
          .single();

        if (error) { console.error("useSubscription fetch error:", error); setLoading(false); return; }

        setAiCallsUsed(data.ai_calls_used || 0);

        let number = data.member_number;
        if (!number) {
          const { count } = await supabase
            .from("user_data")
            .select("*", { count: "exact", head: true })
            .not("member_number", "is", null);
          number = (count || 0) + 1;
          await supabase
            .from("user_data")
            .update({ member_number: number })
            .eq("user_id", user.id);
        }
        setMemberNumber(number);

        // Founder — unlimited everything
        if (user.email === FOUNDER_EMAIL) {
          setIsFounder(true);
          setIsPro(true);
        // First 200 — Pioneer, Pro free
        } else if (number <= FOUNDING_MEMBER_LIMIT) {
          setIsPioneer(true);
          setIsPro(true);
        // Paid Pro
        } else if (data.is_pro) {
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
    // Founder and Pro never get incremented — unlimited
    if (isFounder || isPro) return;
    const next = aiCallsUsed + 1;
    setAiCallsUsed(next);
    await supabase
      .from("user_data")
      .update({ ai_calls_used: next })
      .eq("user_id", user.id);
  }

  // Founder and Pro = unlimited AI, free tier = 10 calls
  const canUseAI  = isFounder || isPro || aiCallsUsed < FREE_AI_LIMIT;
  const callsLeft = isFounder || isPro ? "∞" : Math.max(0, FREE_AI_LIMIT - aiCallsUsed);

  return {
    isPro, isFounder, isPioneer, memberNumber,
    canUseAI, callsLeft, aiCallsUsed,
    FREE_AI_LIMIT, loading, incrementAiCalls,
  };
}
