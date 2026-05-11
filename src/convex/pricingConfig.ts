import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const saleBundleValidator = v.object({
  bundleId:        v.string(),
  salePrice:       v.number(),
  discountPercent: v.optional(v.number()),
});

/* ─── Queries ───────────────────────────────────────────────────── */

/** Returns the singleton pricing config, or null if never saved. */
export const getPricingConfig = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("pricingConfig").collect();
    return rows[0] ?? null;
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const upsertPricingConfig = mutation({
  args: {
    saleActive:    v.boolean(),
    saleName:      v.optional(v.string()),
    saleStartDate: v.optional(v.string()),
    saleEndDate:   v.optional(v.string()),
    saleBundles:   v.optional(v.array(saleBundleValidator)),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("pricingConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("pricingConfig", args);
    }
  },
});
