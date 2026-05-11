import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All portfolio items (admin view) */
export const listPortfolio = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("portfolio")
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/** Only active portfolio items — used on the public site */
export const listActivePortfolio = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("portfolio")
      .filter((q) => q.eq(q.field("active"), true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const createPortfolioItem = mutation({
  args: {
    client:    v.string(),
    title:     v.string(),
    file:      v.string(),
    work:      v.array(v.string()),
    languages: v.array(v.string()),
    genres:    v.array(v.string()),
    order:     v.number(),
    active:    v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("portfolio", args);
  },
});

export const updatePortfolioItem = mutation({
  args: {
    id:        v.id("portfolio"),
    client:    v.optional(v.string()),
    title:     v.optional(v.string()),
    file:      v.optional(v.string()),
    work:      v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    genres:    v.optional(v.array(v.string())),
    order:     v.optional(v.number()),
    active:    v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deletePortfolioItem = mutation({
  args: { id: v.id("portfolio") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/** Step 1 of file upload: returns a short-lived upload URL from Convex Storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Step 2 of file upload: resolves the storage ID to a permanent URL,
 * then inserts a new portfolio item with that URL as the file path.
 */
export const saveUploadedTrack = mutation({
  args: {
    storageId: v.id("_storage"),
    client:    v.string(),
    title:     v.string(),
    work:      v.array(v.string()),
    languages: v.array(v.string()),
    genres:    v.array(v.string()),
    order:     v.number(),
    active:    v.boolean(),
  },
  handler: async (ctx, { storageId, ...rest }) => {
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Storage URL not available");
    return await ctx.db.insert("portfolio", { ...rest, file: url });
  },
});

/** Swap order values of two adjacent items (for reordering). */
export const swapOrder = mutation({
  args: { idA: v.id("portfolio"), idB: v.id("portfolio") },
  handler: async (ctx, { idA, idB }) => {
    const a = await ctx.db.get(idA);
    const b = await ctx.db.get(idB);
    if (!a || !b) return;
    await ctx.db.patch(idA, { order: b.order });
    await ctx.db.patch(idB, { order: a.order });
  },
});
