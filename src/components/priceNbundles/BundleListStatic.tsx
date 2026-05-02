"use client";

import { useState } from "react";
import sanitizeHtml from "sanitize-html";

interface Bundle {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  valuePrice?: number;
  discountTag?: string;
  includes: string[];
  tag?: string | null;
  order: number;
}

interface Rate {
  name: string;
  price: number;
  unit: string;
}

interface Instrumental {
  name: string;
  price: number;
  note?: string;
}

interface SeasonalOffer {
  active: boolean;
  name: string;
  description: string;
  discount: string;
  validFrom?: string | null;
  validUntil?: string | null;
  badgeText?: string;
}

interface PricingData {
  bundles: Bundle[];
  rates: Rate[];
  instrumentals: Instrumental[];
  seasonalOffer: SeasonalOffer;
}

/* ─── Markdown-lite formatter (same rules as existing bundle.tsx) ── */
function formatInclude(text: string): string {
  text = sanitizeHtml(text, { allowedTags: [] });
  text = text.replaceAll(/__([^_\n]+?)__/g, '<span class="text-[#C9A96E] underline underline-offset-2">$1</span>');
  text = text.replaceAll(/\*\*([^*\n]+?)\*\*/g, '<span class="font-medium text-[#F5F0E8]">$1</span>');
  text = text.replaceAll(/\*([^*\n]+?)\*/g, '<span class="text-[rgba(245,240,232,0.45)] text-xs italic">$1</span>');
  return sanitizeHtml(text, {
    allowedTags: ["span"],
    allowedAttributes: { span: ["class"] },
    allowedClasses: {
      span: [
        "text-[#C9A96E]", "underline", "underline-offset-2",
        "font-medium", "text-[#F5F0E8]",
        "text-[rgba(245,240,232,0.45)]", "text-xs", "italic",
      ],
    },
  });
}

/* ─── Single bundle card ─────────────────────────────────────────── */
function BundleCard({ bundle, featured }: { bundle: Bundle; featured: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col transition-all duration-500 cursor-default
        ${featured
          ? "border border-[rgba(201,169,110,0.5)] bg-gradient-to-b from-[rgba(201,169,110,0.06)] to-transparent scale-[1.03]"
          : "border border-[rgba(245,240,232,0.08)] bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-transparent"
        }
        hover:border-[rgba(201,169,110,0.45)]
        p-8 md:p-10
      `}
      style={{
        boxShadow: featured
          ? "0 0 60px rgba(201,169,110,0.06), inset 0 1px 0 rgba(201,169,110,0.15)"
          : hovered
            ? "0 0 40px rgba(201,169,110,0.04)"
            : "none",
      }}
    >
      {/* Tag badge */}
      {bundle.tag && (
        <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 px-5 py-1 bg-[#C9A96E] text-[#080808] text-[0.6rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] whitespace-nowrap">
          {bundle.tag}
        </div>
      )}

      {/* Bundle name */}
      <h3 className="font-['Cormorant_Garamond'] font-light text-2xl md:text-3xl tracking-wide text-[#F5F0E8] mb-2">
        {bundle.name}
      </h3>

      {/* Subtitle */}
      {bundle.subtitle && (
        <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[rgba(245,240,232,0.4)] mb-7 font-['Josefin_Sans']">
          {bundle.subtitle}
        </p>
      )}

      {/* Price */}
      <div className="mb-7">
        <div className="flex items-baseline gap-2">
          <span className="font-['Cormorant_Garamond'] font-light text-5xl text-[#C9A96E] leading-none">
            ${bundle.price.toFixed(2)}
          </span>
        </div>
        {bundle.valuePrice && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[rgba(245,240,232,0.3)] text-sm line-through font-['Josefin_Sans']">
              ${bundle.valuePrice.toFixed(2)} value
            </span>
            {bundle.discountTag && (
              <span className="text-[0.6rem] tracking-[0.2em] text-[#C9A96E] font-['Josefin_Sans'] uppercase">
                {bundle.discountTag}% off
              </span>
            )}
          </div>
        )}
      </div>

      {/* Gold rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,169,110,0.25)] to-transparent mb-7" />

      {/* Includes list */}
      <ul className="flex-1 space-y-3.5 mb-10">
        {bundle.includes.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[rgba(245,240,232,0.65)] font-['Josefin_Sans'] font-light">
            <span className="text-[#C9A96E] mt-px flex-shrink-0 text-base leading-none">—</span>
            <span dangerouslySetInnerHTML={{ __html: formatInclude(item) }} />
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#book-session"
        className={`
          block text-center py-3.5 text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans']
          transition-all duration-300
          ${featured
            ? "bg-[#8B1A1A] text-[#F5F0E8] hover:bg-[#B22222] border border-transparent hover:border-[rgba(201,169,110,0.3)]"
            : "border border-[rgba(201,169,110,0.4)] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#080808]"
          }
        `}
      >
        Book Now
      </a>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */
export function BundleListStatic({ data }: { data: PricingData }) {
  const sorted = [...data.bundles].sort((a, b) => a.order - b.order);

  return (
    <div>
      {/* Seasonal offer banner */}
      {data.seasonalOffer.active && (
        <div className="mb-16 text-center border border-[rgba(201,169,110,0.25)] px-8 py-7 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#080808] px-4">
            <span className="text-[0.6rem] tracking-[0.35em] uppercase text-[#C9A96E] font-['Cinzel']">
              {data.seasonalOffer.badgeText ?? "Limited Time"}
            </span>
          </div>
          <h3 className="font-['Cormorant_Garamond'] font-light text-3xl text-[#F5F0E8] mb-2">
            {data.seasonalOffer.name}
          </h3>
          <p className="text-[rgba(245,240,232,0.55)] text-sm font-['Josefin_Sans'] mb-3">
            {data.seasonalOffer.description}
          </p>
          <span className="text-[#C9A96E] font-['Cormorant_Garamond'] text-2xl italic">
            {data.seasonalOffer.discount}
          </span>
          {data.seasonalOffer.validUntil && (
            <p className="text-[rgba(245,240,232,0.35)] text-xs tracking-widest uppercase mt-2 font-['Josefin_Sans']">
              Ends {data.seasonalOffer.validUntil}
            </p>
          )}
        </div>
      )}

      {/* Bundle cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {sorted.map((bundle, i) => (
          <BundleCard key={bundle.id} bundle={bundle} featured={i === 1} />
        ))}
      </div>
    </div>
  );
}
