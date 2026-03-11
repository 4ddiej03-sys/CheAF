// utils/useSubscription.js
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const FOUNDING_MEMBER_LIMIT = 200;
const FOUNDER_EMAIL = "4ddiej03@gmail.com"; // Only you get the Founder badge

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
        // Step 1 — ensure user_data row exists (upsert so it's always there)
        await supabase
          .from("user_data")
          .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

        // Step 2 — fetch the row
        const { data, error } = await supabase
          .from("user_data")
          .select("is_pro, ai_calls_used, member_number")
          .eq("user_id", user.id)
          .single();

        if (error) { console.error("useSubscription fetch error:", error); setLoading(false); return; }

        setIsPro(data.is_pro || false);
        setAiCallsUsed(data.ai_calls_used || 0);

        let number = data.member_number;

        // Step 3 — if no member_number yet, assign next available
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

        // Step 4 — assign badge
        if (user.email === FOUNDER_EMAIL) {
          setIsFounder(true);
          setIsPro(true);
        } else if (number <= FOUNDING_MEMBER_LIMIT) {
          setIsPioneer(true);
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

  const canUseAI  = isPro || aiCallsUsed < FREE_AI_LIMIT;
  const callsLeft = Math.max(0, FREE_AI_LIMIT - aiCallsUsed);

  return {
    isPro, isFounder, isPioneer, memberNumber,
    canUseAI, callsLeft, aiCallsUsed,
    FREE_AI_LIMIT, loading, incrementAiCalls,
  };
}
