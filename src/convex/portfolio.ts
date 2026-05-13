import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All portfolio items (admin view) */
export const listPortfolio = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
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
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
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
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deletePortfolioItem = mutation({
  args: { id: v.id("portfolio") },
  handler: async (ctx, { id }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});

/** Step 1 of file upload: returns a short-lived upload URL from Convex Storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
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
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Storage URL not available");
    return await ctx.db.insert("portfolio", { ...rest, file: url });
  },
});

/** Swap two items and normalize all orders to 0,1,2,… (fixes gaps/duplicates). */
export const swapOrder = mutation({
  args: { idA: v.id("portfolio"), idB: v.id("portfolio") },
  handler: async (ctx, { idA, idB }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const all = await ctx.db.query("portfolio").collect();
    all.sort((a, b) => a.order - b.order);
    const iA = all.findIndex((x) => x._id === idA);
    const iB = all.findIndex((x) => x._id === idB);
    if (iA === -1 || iB === -1) return;
    [all[iA], all[iB]] = [all[iB], all[iA]];
    for (let i = 0; i < all.length; i++) {
      await ctx.db.patch(all[i]._id, { order: i });
    }
  },
});

/**
 * Seeds the portfolio table with the site's default tracks if it is empty.
 * Safe to call multiple times — no-op when tracks already exist.
 */
export const seedDefaultPortfolio = mutation({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const existing = await ctx.db.query("portfolio").collect();
    if (existing.length > 0) return { seeded: false };

    const defaults = [
      { client: "Josh",       title: "Momento",                       file: "/portfolio/01. Josh.mp3",       work: ["Recorded", "Mixed & Mastered"],                         languages: ["Romanian"], genres: ["RNB"],        order: 0,  active: true },
      { client: "Noam Miko",  title: "Wanna See you Again",           file: "/portfolio/02. Noam.mp3",       work: ["Recorded", "Produced", "Mixed & Mastered", "Written"],  languages: ["English"],  genres: ["Pop Rock"],   order: 1,  active: true },
      { client: "GRANDVIEW",  title: "Why Live For Later",            file: "/portfolio/03. Grandview.mp3",  work: ["Recorded", "Produced"],                                  languages: ["English"],  genres: ["Hip Hop"],   order: 2,  active: true },
      { client: "Sharan",     title: "Allta Gama",                    file: "/portfolio/04. Sharan.mp3",     work: ["Recorded", "Mixed & Mastered"],                         languages: ["Punjabi"],  genres: ["Rap"],       order: 3,  active: true },
      { client: "Niles Baby", title: "Who Are We",                    file: "/portfolio/05. Niles Baby.mp3", work: ["Recorded", "Produced", "Mixed & Mastered"],             languages: ["English"],  genres: ["Afro Beats"],order: 4,  active: true },
      { client: "Noam Miko",  title: "Love Again",                    file: "/portfolio/06. Noam.mp3",       work: ["Recorded", "Produced", "Mixed & Mastered", "Written"],  languages: ["English"],  genres: ["Hip Hop"],   order: 5,  active: true },
      { client: "Josh",       title: "Berders",                       file: "/portfolio/08. Josh.mp3",       work: ["Recorded", "Mixed & Mastered"],                         languages: ["Romanian"], genres: ["RNB"],       order: 6,  active: true },
      { client: "IVY",        title: "Healer",                        file: "/portfolio/10. IVY.mp3",        work: ["Recorded", "Mixed & Mastered"],                         languages: ["English"],  genres: ["Afro Beats"],order: 7,  active: true },
      { client: "Noam Miko",  title: "Page In Your Book",             file: "/portfolio/11. noam.mp3",       work: ["Recorded", "Produced", "Mixed & Mastered", "Written"],  languages: ["English"],  genres: ["Pop"],       order: 8,  active: true },
      { client: "Niles Baby", title: "Who are we (Noam Miko REMIX)",  file: "/portfolio/13 Niles Baby.mp3",  work: ["Recorded", "Produced", "Mixed & Mastered"],             languages: ["English"],  genres: ["EDM"],       order: 9,  active: true },
      { client: "Noam Miko",  title: "The Moment Our Lips Touched",   file: "/portfolio/14. noam.mp3",       work: ["Recorded", "Produced", "Mixed & Mastered", "Written"],  languages: ["English"],  genres: ["Pop"],       order: 10, active: true },
    ];

    for (const item of defaults) {
      await ctx.db.insert("portfolio", item);
    }

    return { seeded: true };
  },
});

export const migrateWorkTags = mutation({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const rows = await ctx.db.query("portfolio").collect();
    let updated = 0;
    for (const row of rows) {
      const hasMixed = row.work.includes("Mixed");
      const hasMastered = row.work.includes("Mastered");
      const hasMixedMastered = row.work.includes("Mixed & Mastered");
      const hasRecorded = row.work.includes("Recorded");
      if (!hasMixed && !hasMastered && hasMixedMastered && hasRecorded) continue;
      const work = row.work
        .filter((t: string) => t !== "Mixed" && t !== "Mastered")
        .concat(hasMixedMastered ? [] : (hasMixed || hasMastered ? ["Mixed & Mastered"] : []))
        .concat(hasRecorded ? [] : ["Recorded"]);
      // Put Recorded first
      const ordered = ["Recorded", ...work.filter((t: string) => t !== "Recorded")];
      await ctx.db.patch(row._id, { work: ordered });
      updated++;
    }
    return { updated };
  },
});
