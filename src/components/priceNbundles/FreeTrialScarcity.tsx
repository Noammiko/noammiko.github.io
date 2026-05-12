"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";

function ScarcityInner() {
  const settings   = useQuery(api.freeAccess.getSettings);
  const amountWeek = useQuery(api.freeAccess.getAmountWeek, {});

  const max       = settings?.weeklySlots ?? 5;
  const used      = amountWeek ?? 0;
  const remaining = Math.max(0, max - used);
  const pct       = max > 0 ? Math.min(100, (used / max) * 100) : 0;

  return (
    <div className="free-trial-scarcity">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span className="font-sans text-gold" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>
          Spots This Week
        </span>
        <span className="font-serif text-cream" style={{ fontSize: "22px" }}>
          {remaining} / {max} left
        </span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.08)", height: "3px", width: "100%", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#C9A96E", width: `${pct}%`, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

export const FreeTrialScarcity = withConvexProvider(ScarcityInner);
