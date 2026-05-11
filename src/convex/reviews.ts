import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All reviews, ordered by display order */
export const listReviews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/** Only active reviews — used on the public site */
export const listActiveReviews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("active"), true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const createReview = mutation({
  args: {
    name:        v.string(),
    text:        v.string(),
    rating:      v.number(),
    date:        v.string(),
    image:       v.optional(v.string()),
    imagegoogle: v.optional(v.string()),
    url:         v.optional(v.string()),
    active:      v.boolean(),
    order:       v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", args);
  },
});

export const updateReview = mutation({
  args: {
    id:          v.id("reviews"),
    name:        v.optional(v.string()),
    text:        v.optional(v.string()),
    rating:      v.optional(v.number()),
    date:        v.optional(v.string()),
    image:       v.optional(v.string()),
    imagegoogle: v.optional(v.string()),
    url:         v.optional(v.string()),
    active:      v.optional(v.boolean()),
    order:       v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deleteReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
