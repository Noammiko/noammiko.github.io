import { action } from "./_generated/server";
import { v } from "convex/values";

const OWNER  = "Noammiko";
const REPO   = "noammiko.github.io";
const BRANCH = "master";

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Uploads a file to the GitHub repo via the Contents API and returns the
 * raw.githubusercontent.com URL. File content must be base64-encoded.
 * Requires GITHUB_TOKEN set as a Convex environment variable with repo write access.
 */
export const uploadToGitHub = action({
  args: {
    fileName:    v.string(),
    fileContent: v.string(), // base64-encoded file bytes
    folder:      v.union(v.literal("gallery"), v.literal("portfolio")),
  },
  handler: async (ctx, { fileName, fileContent, folder }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN environment variable not configured in Convex");

    const safe   = sanitizeFileName(fileName);
    const unique = `${Date.now()}-${safe}`;
    const path   = `media/${folder}/${unique}`;
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

    const headers: Record<string, string> = {
      "Authorization":        `Bearer ${token}`,
      "Accept":               "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type":         "application/json",
    };

    const res = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Upload ${folder} file: ${unique}`,
        content: fileContent,
        branch:  BRANCH,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GitHub upload failed (${res.status}): ${errText}`);
    }

    return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
  },
});
