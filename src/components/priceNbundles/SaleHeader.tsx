"use client";

/**
 * SaleHeader
 *
 * Reads saleActive / saleName / saleEndDate live from Convex so the
 * sale headline and countdown on the pricing page update the moment
 * you hit "Save" in the admin — no deploy needed.
 *
 * - saleActive = false  →  renders nothing (banner hidden)
 * - saleActive = true   →  shows the sale name + live countdown
 */

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";

/* ─── Countdown ──────────────────────────────────────────────────── */
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Countdown({ endDate }: { endDate: string }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const end = new Date(endDate).getTime();

    function tick() {
      const diff = end - Date.now();
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div style={{ display: "inline-flex", gap: "12px", alignItems: "center" }}>
      <div className="cd-unit">
        <span className="cd-num">{pad(t.d)}</span>
        <span className="cd-label">Days</span>
      </div>
      <span className="cd-sep">:</span>
      <div className="cd-unit">
        <span className="cd-num">{pad(t.h)}</span>
        <span className="cd-label">Hrs</span>
      </div>
      <span className="cd-sep">:</span>
      <div className="cd-unit">
        <span className="cd-num">{pad(t.m)}</span>
        <span className="cd-label">Min</span>
      </div>
      <span className="cd-sep">:</span>
      <div className="cd-unit">
        <span className="cd-num">{pad(t.s)}</span>
        <span className="cd-label">Sec</span>
      </div>
    </div>
  );
}

/* ─── Inner component (uses Convex) ─────────────────────────────── */
function SaleHeaderInner() {
  // @ts-ignore — generated types may lag behind schema changes
  const config = useQuery(api.pricingConfig.getPricingConfig);

  /* Loading → render nothing to avoid layout flash */
  if (config === undefined) return null;

  const saleActive  = config?.saleActive  ?? false;
  const saleName    = config?.saleName    ?? "Spring Sale";
  const saleEndDate = config?.saleEndDate ?? "";

  if (!saleActive) return null;

  return (
    <>
      {/* Sale name headline */}
      <div className="text-center reveal mb-4">
        <span
          className="font-serif font-light uppercase text-gold block"
          style={{
            fontSize: "clamp(3rem,8vw,7rem)",
            lineHeight: "1",
            letterSpacing: "0.06em",
          }}
        >
          {saleName}
        </span>
      </div>

      {/* Countdown (only when an end date is set) */}
      {saleEndDate && (
        <div className="text-center reveal mb-10">
          <Countdown endDate={saleEndDate} />
        </div>
      )}
    </>
  );
}

/** Public export: ConvexProvider-wrapped sale header. */
export const SaleHeader = withConvexProvider(SaleHeaderInner);
