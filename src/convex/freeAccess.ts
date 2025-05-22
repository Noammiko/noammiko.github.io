import { query } from "./_generated/server";
import { Temporal } from "@js-temporal/polyfill"
import { v } from "convex/values"

export const getAmountWeek = query({
  args: {
    timezone: v.optional(v.string()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const tz = args.timezone ?? "America/Toronto" // EST timezone
    const now = Temporal.Now.zonedDateTimeISO(tz);

    // Get to start of week by subtracting days until we reach Monday
    const startOfWeek = now.subtract({ days: now.dayOfWeek - 1 })
      // Set to start of day (midnight)
      .startOfDay();

    // Get milliseconds since epoch
    const milliseconds = startOfWeek.epochMilliseconds;

    const tasks = await ctx.db.query("free")
      .withIndex("by_creation_time", (q) => q.gte("_creationTime", milliseconds))
      .filter((q) => q.eq(q.field("approved"), true))
      .collect();
    return tasks.reduce((a) => a + 1, 0)
  },
});
