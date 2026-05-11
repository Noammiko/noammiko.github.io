# Environment Variables

Two places to set variables: **Convex dashboard** (runtime) and **GitHub Actions secrets** (CI/CD build).
Local dev uses `.env.local` — copy `.env.example` and fill it in, never commit it.

---

## GitHub Actions Secrets

Set these at: **GitHub repo → Settings → Secrets and variables → Actions**

| Variable | Description |
|---|---|
| `CONVEX_DEPLOY_KEY` | Convex deploy key. Get it from Convex dashboard → Settings → Deploy keys. Required for the CI/CD build to push Convex functions and fetch data. |

---

## Convex Environment Variables

Set these at: **[Convex dashboard](https://dashboard.convex.dev) → your deployment → Settings → Environment Variables**

### Deploy trigger (GitHub integration)

These let the admin panel trigger site rebuilds and update pricing.json via the GitHub API.

| Variable | Example | Description |
|---|---|---|
| `GITHUB_DEPLOY_TOKEN` | `github_pat_...` | Fine-grained PAT scoped to `noammiko/noammiko.github.io` only, with **Contents** (read & write) and **Actions** (read & write) permissions. Create at github.com/settings/tokens → Fine-grained tokens. |
| `GITHUB_OWNER` | `Noammiko` | GitHub username. |
| `GITHUB_REPO` | `noammiko.github.io` | Repository name. |
| `GITHUB_BRANCH` | `master` | Branch to commit pricing changes to. Defaults to `master` if not set. |

### Email notifications

| Variable | Example | Description |
|---|---|---|
| `RESEND_API_KEY` | `re_abc123...` | Resend API key for sending email notifications on form submissions. Get it from resend.com → API Keys. Emails send from `notifications@miko-recordingstudio.ca`. |

### Discord notifications (optional)

| Variable | Example | Description |
|---|---|---|
| `DISCORD_WEBHOOK` | `https://discord.com/api/webhooks/...` | Discord incoming webhook URL. If not set, Discord notifications are silently skipped. Create in Discord server → channel settings → Integrations. |

### Admin account (one-time UI setup — no env vars needed)

No environment variables required. On first deploy, visit `/admin` — because no users exist yet the page shows "Create Admin Account". Fill in your email and password and submit. Convex Auth hashes it with bcrypt+salt and stores it. After that the sign-up form is gone permanently and only sign-in is shown.

---

## Local Development

Copy `.env.example` to `.env.local` and fill in real values:

```
CONVEX_DEPLOY_KEY=prod:...
CONVEX_URL=https://your-deployment.convex.cloud
```

`CONVEX_URL` is injected automatically by `bunx convex deploy` during CI, but is needed manually for local dev. All other variables (GitHub, Resend, Discord) should also be set in your local `.env.local` if you want those features to work locally.

`.env.local` is gitignored — never commit real credentials.
