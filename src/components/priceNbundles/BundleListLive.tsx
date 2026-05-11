"use client";

/**
 * BundleListLive
 *
 * Reads bundle / sale configuration live from Convex so admin Discounts
 * changes appear on the site immediately without a rebuild.
 * Falls back to the static pricing.json when Convex has no config yet.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";
import { BundleListStatic } from "./BundleListStatic";

/* ── Match the shape BundleListStatic expects ─────────────────────── */
interface PricingBundle {
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
interface PricingData {
  bundles: PricingBundle[];
  rates: { name: string; price: number; unit: string }[];
  instrumentals: { name: string; price: number; note?: string }[];
  seasonalOffer: {
    active: boolean;
    name: string;
    description: string;
    discount: string;
    validFrom?: string | null;
    validUntil?: string | null;
    badgeText?: string;
  };
}

function BundleListInner({ fallback }: { fallback: PricingData }) {
  // @ts-ignore — pricingConfig generated types may lag behind
  const config = useQuery(api.pricingConfig.getPricingConfig);

  /* While loading or no Convex config yet → show static fallback */
  if (!config || config.bundles.length === 0) {
    return <BundleListStatic data={fallback} />;
  }

  /* Build live data from Convex ─────────────────────────────────── */
  const live: PricingData = {
    ...fallback,
    bundles: config.bundles.map(
      (
        b: {
          name: string;
          subtitle: string;
          price: number;
          valuePrice?: number;
          discountPercent?: number;
          includes: string[];
          tag?: string;
        },
        i: number
      ) => ({
        id: `bundle-${i}`,
        name: b.name,
        subtitle: b.subtitle,
        price: b.price,
        valuePrice: b.valuePrice,
        discountTag:
          b.discountPercent != null ? String(b.discountPercent) : undefined,
        includes: b.includes,
        tag: b.tag ?? null,
        order: i,
      })
    ),
    seasonalOffer: {
      active: config.saleActive ?? false,
      name: config.saleName ?? fallback.seasonalOffer.name,
      description: fallback.seasonalOffer.description,
      discount: fallback.seasonalOffer.discount,
      validFrom: fallback.seasonalOffer.validFrom,
      validUntil: config.saleEndDate ?? fallback.seasonalOffer.validUntil,
      badgeText: fallback.seasonalOffer.badgeText,
    },
  };

  return <BundleListStatic data={live} />;
}

/** Public export: ConvexProvider-wrapped bundle list. */
export const BundleListLive = withConvexProvider(BundleListInner);
