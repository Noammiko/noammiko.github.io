import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All discount records (admin view) */
export const listDiscounts = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db.query("discounts").order("desc").collect();
  },
});

/**
 * Returns the currently active discount, or null.
 * A discount is "active" when:
 *   1. active === true, AND
 *   2. today's date falls within [validFrom, validUntil] (if those are set).
 */
export const getActiveDiscount = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().substring(0, 10);

    const all = await ctx.db
      .query("discounts")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const active = all.find((d) => {
      const afterStart  = !d.validFrom  || today >= d.validFrom;
      const beforeEnd   = !d.validUntil || today <= d.validUntil;
      return afterStart && beforeEnd;
    });

    return active ?? null;
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const createDiscount = mutation({
  args: {
    name:            v.string(),
    description:     v.optional(v.string()),
    discountPercent: v.number(),
    validFrom:       v.optional(v.string()),
    validUntil:      v.optional(v.string()),
    active:          v.boolean(),
    badgeText:       v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db.insert("discounts", args);
  },
});

export const updateDiscount = mutation({
  args: {
    id:              v.id("discounts"),
    name:            v.optional(v.string()),
    description:     v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    validFrom:       v.optional(v.string()),
    validUntil:      v.optional(v.string()),
    active:          v.optional(v.boolean()),
    badgeText:       v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deleteDiscount = mutation({
  args: { id: v.id("discounts") },
  handler: async (ctx, { id }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});
