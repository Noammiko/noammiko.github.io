import { action } from "./_generated/server";

/**
 * Convex action — triggers a GitHub Actions deploy via repository_dispatch.
 *
 * Set these in the Convex dashboard → Settings → Environment Variables:
 *   GITHUB_DEPLOY_TOKEN   — Personal Access Token with "repo" scope
 *   GITHUB_OWNER          — e.g. "noammiko"
 *   GITHUB_REPO           — e.g. "miko-studio-site"
 */
export const triggerDeploy = action({
  args: {},
  handler: async (_ctx) => {
    const token = process.env.GITHUB_DEPLOY_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo  = process.env.GITHUB_REPO;

    if (!token || !owner || !repo) {
      throw new Error(
        "GitHub deploy vars not configured. Add GITHUB_DEPLOY_TOKEN, GITHUB_OWNER, and GITHUB_REPO in the Convex dashboard → Settings → Environment Variables."
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization:          `Bearer ${token}`,
          Accept:                 "application/vnd.github+json",
          "Content-Type":         "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          event_type:     "deploy",
          client_payload: { type: "full" },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub API responded ${res.status}: ${text}`);
    }
  },
});
