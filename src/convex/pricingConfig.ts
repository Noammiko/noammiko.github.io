import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const bundleValidator = v.object({
  name:            v.string(),
  subtitle:        v.string(),
  price:           v.number(),
  valuePrice:      v.optional(v.number()),
  discountPercent: v.optional(v.number()),
  includes:        v.array(v.string()),
  tag:             v.optional(v.string()),
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
    saleActive:  v.boolean(),
    saleName:    v.optional(v.string()),
    saleEndDate: v.optional(v.string()),
    bundles:     v.array(bundleValidator),
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
