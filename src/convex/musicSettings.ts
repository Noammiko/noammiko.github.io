import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULTS = {
  featuredTitle:    "Live Inside My Mind",
  featuredTrackUrl: "https://open.spotify.com/track/4A50VQrWoyCQoGhHMEBrEW",
  promotingTracks:  [] as string[],
  discographyUrls:  ["https://open.spotify.com/album/3iTc5FAM86crv2Pvwf881Y"],
};

/* ─── Query ─────────────────────────────────────────────────────── */

/** Returns the music settings doc, or sensible defaults if none exists yet. */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("musicSettings").first();
    return doc ?? DEFAULTS;
  },
});

/* ─── Mutation ──────────────────────────────────────────────────── */

/** Creates or updates the single musicSettings document. */
export const upsertSettings = mutation({
  args: {
    featuredTitle:    v.string(),
    featuredTrackUrl: v.string(),
    promotingTracks:  v.array(v.string()),
    discographyUrls:  v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("musicSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("musicSettings", args);
    }
  },
});
