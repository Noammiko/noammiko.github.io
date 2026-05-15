import { action } from "./_generated/server";

/**
 * Returns the GitHub token to authenticated admins only.
 * The frontend then uploads the file directly to GitHub — no file data
 * ever passes through Convex, so there is no argument size limit.
 */
export const getGitHubToken = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN not configured in Convex");
    return token;
  },
});
