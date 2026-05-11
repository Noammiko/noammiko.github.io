/**
 * POST /api/update-base-bundles
 *
 * Updates the `bundles` array in src/data/pricing.json via the GitHub
 * Contents API, then a push event naturally triggers the CI/CD rebuild
 * (no separate trigger-deploy call needed).
 *
 * Reuses the same env vars as trigger-deploy.ts:
 *   GITHUB_DEPLOY_TOKEN  — PAT with repo scope
 *   GITHUB_OWNER         — e.g. "noammiko"
 *   GITHUB_REPO          — e.g. "miko-studio-site"
 *   GITHUB_BRANCH        — branch to commit to (default "master")
 */

import type { APIRoute } from "astro";

export const prerender = false;

const PRICING_PATH = "src/data/pricing.json";

export const POST: APIRoute = async ({ request }) => {
  const token  = import.meta.env.GITHUB_DEPLOY_TOKEN;
  const owner  = import.meta.env.GITHUB_OWNER;
  const repo   = import.meta.env.GITHUB_REPO;
  const branch = import.meta.env.GITHUB_BRANCH ?? "master";

  if (!token || !owner || !repo) {
    return json({ error: "GitHub env vars not configured." }, 500);
  }

  let bundles: unknown[];
  try {
    const body = await request.json();
    if (!Array.isArray(body.bundles)) throw new Error();
    bundles = body.bundles;
  } catch {
    return json({ error: "Body must be { bundles: [...] }" }, 400);
  }

  const headers = {
    Authorization:          `Bearer ${token}`,
    Accept:                 "application/vnd.github+json",
    "Content-Type":         "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  /* 1 ─ Fetch current file to get SHA + content */
  const getRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${PRICING_PATH}?ref=${branch}`,
    { headers }
  );
  if (!getRes.ok) {
    return json({ error: `GitHub GET failed: ${await getRes.text()}` }, 502);
  }
  const fileData  = await getRes.json() as { content: string; sha: string };
  const existing  = JSON.parse(decode64(fileData.content));

  /* 2 ─ Merge bundles into the rest of the file */
  const updated   = { ...existing, bundles };
  const newBase64 = encode64(JSON.stringify(updated, null, 2));

  /* 3 ─ PUT updated file */
  const putRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${PRICING_PATH}`,
    {
      method:  "PUT",
      headers,
      body: JSON.stringify({
        message: "Update base bundle prices [admin]",
        content: newBase64,
        sha:     fileData.sha,
        branch,
      }),
    }
  );
  if (!putRes.ok) {
    return json({ error: `GitHub PUT failed: ${await putRes.text()}` }, 502);
  }

  return json({ ok: true });
};

/* ── Helpers ──────────────────────────────────────────────────────── */

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
