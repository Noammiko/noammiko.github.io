"use client";

/**
 * BundleListLive
 *
 * Base bundle data (name, subtitle, includes, base price) comes from pricing.json
 * baked in at build time via the `fallback` prop.
 *
 * Sale overrides (which bundles are discounted, at what price) are read live
 * from Convex so admin sale changes appear immediately — no rebuild needed.
 *
 * When no sale is active, base prices are shown with no strikethrough.
 * When a sale is active and the current time is within the sale window,
 * selected bundles show their sale price (base price becomes the "was" value).
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";
import { BundleListStatic } from "./BundleListStatic";

/* ── Types expected by BundleListStatic ───────────────────────────── */
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

type SaleBundle = { bundleId: string; salePrice: number; discountPercent?: number };

function BundleListInner({ fallback }: { fallback: PricingData }) {
  // @ts-ignore — generated types may lag schema
  const config = useQuery(api.pricingConfig.getPricingConfig);

  /* Determine whether the sale is currently in its active window */
  const now = new Date();
  const withinWindow =
    config?.saleActive === true &&
    (!config.saleStartDate || new Date(config.saleStartDate) <= now) &&
    (!config.saleEndDate   || new Date(config.saleEndDate)   >  now);

  /* Build a quick lookup: bundleId → sale override */
  const saleMap = new Map<string, SaleBundle>();
  if (withinWindow && Array.isArray(config?.saleBundles)) {
    (config.saleBundles as SaleBundle[]).forEach((sb) => saleMap.set(sb.bundleId, sb));
  }

  /* Merge base prices with any sale overrides */
  const mergedBundles: PricingBundle[] = fallback.bundles.map((base) => {
    const override = saleMap.get(base.id);
    if (override) {
      return {
        ...base,
        price:       override.salePrice,
        valuePrice:  base.price,           // original becomes "was" price
        discountTag: override.discountPercent != null
          ? String(override.discountPercent)
          : undefined,
      };
    }
    /* No sale for this bundle — show base price, no strikethrough */
    return { ...base, valuePrice: undefined, discountTag: undefined };
  });

  const live: PricingData = {
    ...fallback,
    bundles: mergedBundles,
    seasonalOffer: {
      active:      withinWindow,
      name:        config?.saleName        ?? fallback.seasonalOffer.name,
      description: fallback.seasonalOffer.description,
      discount:    fallback.seasonalOffer.discount,
      validFrom:   config?.saleStartDate   ?? fallback.seasonalOffer.validFrom,
      validUntil:  config?.saleEndDate     ?? fallback.seasonalOffer.validUntil,
      badgeText:   fallback.seasonalOffer.badgeText,
    },
  };

  return <BundleListStatic data={live} />;
}

/** Public export: ConvexProvider-wrapped bundle list. */
export const BundleListLive = withConvexProvider(BundleListInner);
