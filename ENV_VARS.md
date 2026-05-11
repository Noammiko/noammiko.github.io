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
| `GITHUB_DEPLOY_TOKEN` | `ghp_abc123...` | GitHub Personal Access Token with **repo** scope. Create at github.com/settings/tokens. |
| `GITHUB_OWNER` | `noammiko` | Your GitHub username or org name. |
| `GITHUB_REPO` | `miko-studio-site` | Repository name (without the owner prefix). |
| `GITHUB_BRANCH` | `master` | Branch to commit pricing changes to. Defaults to `master` if not set. |

### Email notifications

| Variable | Example | Description |
|---|---|---|
| `RESEND_API_KEY` | `re_abc123...` | Resend API key for sending email notifications on form submissions. Get it from resend.com → API Keys. Emails send from `notifications@miko-recordingstudio.ca`. |

### Discord notifications (optional)

| Variable | Example | Description |
|---|---|---|
| `DISCORD_WEBHOOK` | `https://discord.com/api/webhooks/...` | Discord incoming webhook URL. If not set, Discord notifications are silently skipped. Create in Discord server → channel settings → Integrations. |

### Admin account (one-time setup only)

These are only needed the first time you create the admin account. Once the account exists in Convex Auth, these are no longer read.

| Variable | Example | Description |
|---|---|---|
| `ADMIN_EMAIL` | `admin@miko-recordingstudio.ca` | The email address for the admin login. |
| `ADMIN_PASSWORD` | *(strong password)* | The initial admin password — minimum 16 characters. Convex Auth hashes it with bcrypt+salt on first sign-up. After setup you can remove this variable. |

---

## Local Development

Copy `.env.example` to `.env.local` and fill in real values:

```
CONVEX_DEPLOY_KEY=prod:...
CONVEX_URL=https://your-deployment.convex.cloud
```

`CONVEX_URL` is injected automatically by `bunx convex deploy` during CI, but is needed manually for local dev. All other variables (GitHub, Resend, Discord) should also be set in your local `.env.local` if you want those features to work locally.

`.env.local` is gitignored — never commit real credentials.
