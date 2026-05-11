import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All gallery images (admin view, sorted by order) */
export const listGallery = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db
      .query("gallery")
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/** Only active images — used on the public site */
export const listActiveGallery = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gallery")
      .filter((q) => q.eq(q.field("active"), true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const updateGalleryItem = mutation({
  args: {
    id:       v.id("gallery"),
    alt:      v.optional(v.string()),
    caption:  v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    order:    v.optional(v.number()),
    active:   v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deleteGalleryItem = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, { id }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});

/** Step 1 of image upload: returns a short-lived upload URL from Convex Storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Step 2 of image upload: resolves the storage ID to a permanent URL,
 * then inserts a new gallery item with that URL as imageUrl.
 */
export const saveUploadedImage = mutation({
  args: {
    storageId: v.id("_storage"),
    alt:       v.string(),
    caption:   v.optional(v.string()),
    order:     v.number(),
    active:    v.boolean(),
  },
  handler: async (ctx, { storageId, ...rest }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Storage URL not available");
    return await ctx.db.insert("gallery", { ...rest, imageUrl: url });
  },
});

/** Swap order values of two adjacent items (for reordering). */
export const swapOrder = mutation({
  args: { idA: v.id("gallery"), idB: v.id("gallery") },
  handler: async (ctx, { idA, idB }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const a = await ctx.db.get(idA);
    const b = await ctx.db.get(idB);
    if (!a || !b) return;
    await ctx.db.patch(idA, { order: b.order });
    await ctx.db.patch(idB, { order: a.order });
  },
});

/**
 * Seeds the gallery table with the 7 existing studio photos if it is empty.
 * These reference the static public files at /galary/N.jpeg.
 * Safe to call multiple times — no-op when images already exist.
 */
export const seedDefaultGallery = mutation({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const existing = await ctx.db.query("gallery").collect();
    if (existing.length > 0) return { seeded: false };

    const defaults = [
      { alt: "Recording booth",    caption: undefined, imageUrl: "/galary/1.jpeg", order: 0, active: true },
      { alt: "Mixing desk",        caption: undefined, imageUrl: "/galary/2.jpeg", order: 1, active: true },
      { alt: "Studio space",       caption: undefined, imageUrl: "/galary/3.jpeg", order: 2, active: true },
      { alt: "Vocal booth",        caption: undefined, imageUrl: "/galary/4.jpeg", order: 3, active: true },
      { alt: "Studio equipment",   caption: undefined, imageUrl: "/galary/5.jpeg", order: 4, active: true },
      { alt: "Studio monitors",    caption: undefined, imageUrl: "/galary/6.jpeg", order: 5, active: true },
      { alt: "Session",            caption: undefined, imageUrl: "/galary/7.jpeg", order: 6, active: true },
    ];

    for (const item of defaults) {
      const { caption, ...rest } = item;
      await ctx.db.insert("gallery", caption ? { ...rest, caption } : rest);
    }

    return { seeded: true };
  },
});
