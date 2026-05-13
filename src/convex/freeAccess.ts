import { mutation, query } from "./_generated/server";
import { Temporal } from "@js-temporal/polyfill";
import { v } from "convex/values";

/* ─── Settings (singleton document) ────────────────────────────── */

const SETTINGS_DEFAULTS = { enabled: true, weeklySlots: 5 };

/** Returns free-trial feature settings, falling back to defaults. */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("freeSettings").first();
    return doc ?? SETTINGS_DEFAULTS;
  },
});

/** Creates or updates the single freeSettings document. */
export const upsertSettings = mutation({
  args: {
    enabled:     v.boolean(),
    weeklySlots: v.number(),
  },
  handler: async (ctx, args) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const existing = await ctx.db.query("freeSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("freeSettings", args);
    }
  },
});

/* ─── Weekly slot counter (public) ─────────────────────────────── */

/**
 * Returns the number of *approved* free-trial bookings this week.
 * Used by the pricing page to show remaining spots.
 */
export const getAmountWeek = query({
  args: {
    timezone: v.optional(v.string()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const tz = args.timezone ?? "America/Toronto";
    const now = Temporal.Now.zonedDateTimeISO(tz);

    const startOfWeek = now
      .subtract({ days: now.dayOfWeek - 1 })
      .startOfDay();

    const milliseconds = startOfWeek.epochMilliseconds;

    const tasks = await ctx.db
      .query("free")
      .filter((q) =>
        q.and(
          q.eq(q.field("approved"), true),
          q.gte(q.field("approvedAt"), milliseconds)
        )
      )
      .collect();

    return tasks.length;
  },
});

/* ─── Free trial submissions (admin) ────────────────────────────── */

/** All free-trial submissions, newest first. Admin only. */
export const getFreeTrials = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db.query("free").order("desc").collect();
  },
});

/** Approve a free-trial submission. */
export const approveFree = mutation({
  args: { id: v.id("free") },
  handler: async (ctx, { id }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.patch(id, { approved: true, approvedAt: Date.now() });
  },
});

/** Deny (reject) a free-trial submission. */
export const denyFree = mutation({
  args: { id: v.id("free") },
  handler: async (ctx, { id }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.patch(id, { approved: false });
  },
});
