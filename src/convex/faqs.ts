import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All FAQs, ordered by display order */
export const listFaqs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("faqs")
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/** Only active FAQs — used on the public site */
export const listActiveFaqs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("faqs")
      .filter((q) => q.eq(q.field("active"), true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const createFaq = mutation({
  args: {
    question: v.string(),
    answer:   v.string(),
    order:    v.number(),
    active:   v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("faqs", args);
  },
});

export const updateFaq = mutation({
  args: {
    id:       v.id("faqs"),
    question: v.optional(v.string()),
    answer:   v.optional(v.string()),
    order:    v.optional(v.number()),
    active:   v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deleteFaq = mutation({
  args: { id: v.id("faqs") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
