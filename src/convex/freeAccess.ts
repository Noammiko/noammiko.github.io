import { query } from "./_generated/server";
import { Temporal } from "@js-temporal/polyfill"

export const get = query({
  args: {},
  handler: async (ctx) => {
    const now = Temporal.Now.zonedDateTimeISO('America/Toronto'); // EST timezone

    // Get to start of week by subtracting days until we reach Monday
    const startOfWeek = now.subtract({ days: now.dayOfWeek - 1 })
      // Set to start of day (midnight)
      .startOfDay();

    // Get milliseconds since epoch
    const milliseconds = startOfWeek.epochMilliseconds;

    const tasks = await ctx.db.query("free")
      .filter((q) => q.and(q.gte(q.field("requested"), milliseconds), q.eq(q.field("approved"), true)))
      .collect();
    return tasks.reduce((a) => a + 1, 0)
  },
});
