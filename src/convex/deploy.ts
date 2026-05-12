import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex actions — interact with GitHub via repository_dispatch and Contents API.
 *
 * Set these in the Convex dashboard → Settings → Environment Variables:
 *   GITHUB_DEPLOY_TOKEN   — Personal Access Token with "repo" scope
 *   GITHUB_OWNER          — e.g. "noammiko"
 *   GITHUB_REPO           — e.g. "miko-studio-site"
 *   GITHUB_BRANCH         — branch to commit to (default "master")
 */

function ghHeaders(token: string) {
  return {
    Authorization:          `Bearer ${token}`,
    Accept:                 "application/vnd.github+json",
    "Content-Type":         "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function decode64(b64: string): string {
  const clean = b64.replace(/\n/g, "");
  const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encode64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function requireGhEnv() {
  const token  = process.env.GITHUB_DEPLOY_TOKEN;
  const owner  = process.env.GITHUB_OWNER;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "master";
  if (!token || !owner || !repo) {
    throw new Error(
      "GitHub deploy vars not configured. Add GITHUB_DEPLOY_TOKEN, GITHUB_OWNER, and GITHUB_REPO in the Convex dashboard → Settings → Environment Variables."
    );
  }
  return { token, owner, repo, branch };
}

/** Triggers a full GitHub Actions rebuild via repository_dispatch. */
export const triggerDeploy = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { token, owner, repo } = requireGhEnv();

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/dispatches`,
      {
        method: "POST",
        headers: ghHeaders(token),
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

/**
 * Updates the `bundles` array in src/data/pricing.json via the GitHub
 * Contents API, then the resulting push triggers the CI/CD rebuild.
 */
export const updateBaseBundles = action({
  args: { bundles: v.array(v.any()) },
  handler: async (ctx, { bundles }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { token, owner, repo, branch } = requireGhEnv();
    const PRICING_PATH = "src/data/pricing.json";
    const headers = ghHeaders(token);

    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${PRICING_PATH}?ref=${branch}`,
      { headers }
    );
    if (!getRes.ok) throw new Error(`GitHub GET failed: ${await getRes.text()}`);

    const fileData = await getRes.json() as { content: string; sha: string };
    const existing = JSON.parse(decode64(fileData.content));
    const updated  = { ...existing, bundles };

    const putRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${PRICING_PATH}`,
      {
        method:  "PUT",
        headers,
        body: JSON.stringify({
          message: "Update base bundle prices [admin]",
          content: encode64(JSON.stringify(updated, null, 2)),
          sha:     fileData.sha,
          branch,
        }),
      }
    );
    if (!putRes.ok) throw new Error(`GitHub PUT failed: ${await putRes.text()}`);
  },
});
