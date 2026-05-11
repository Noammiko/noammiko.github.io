import { query } from "./_generated/server";

/**
 * Returns true if at least one user account exists in Convex Auth.
 * The admin UI uses this to decide whether to show the "sign up" path
 * (only on first boot before any account is created) vs. sign-in only.
 */
export const hasAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    return user !== null;
  },
});
