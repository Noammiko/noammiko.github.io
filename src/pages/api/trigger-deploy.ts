/**
 * POST /api/trigger-deploy
 *
 * Calls the GitHub repository_dispatch API to trigger a
 * GitHub Actions rebuild of the static site.
 *
 * Required environment variables (set in Netlify/Vercel/GitHub secrets):
 *   GITHUB_DEPLOY_TOKEN   — a GitHub Personal Access Token with repo scope
 *   GITHUB_OWNER          — e.g. "noammiko"
 *   GITHUB_REPO           — e.g. "miko-studio-site"
 *
 * Body JSON: { type: "portfolio" | "music" | "pricing" | "full" }
 */

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const token = import.meta.env.GITHUB_DEPLOY_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo  = import.meta.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return new Response(
      JSON.stringify({ error: "GitHub deploy environment variables not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { type?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventType = body.type ?? "full";

  const ghRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/dispatches`,
    {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        Accept:         "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        event_type:      "deploy",
        client_payload:  { type: eventType },
      }),
    }
  );

  if (!ghRes.ok) {
    const text = await ghRes.text();
    return new Response(JSON.stringify({ error: text }), {
      status: ghRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, type: eventType }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
