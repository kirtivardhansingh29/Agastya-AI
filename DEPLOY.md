# Deploying Agastya AI

Full-stack app: **Express backend** (`server/`) + **React/Vite frontend** (`client/`).

**Deployment split:**
- **Backend → Render** (Node web service) — config: `render.yaml` at repo root
- **Frontend → Vercel** (static site) — config: `vercel.json` at repo root

Both configs are already in the repo. Do not change app code to make a deploy work —
if something fails, check the step's settings first.

---

## 0. Before you deploy (do this once)

### Rotate the Firebase service key ⚠️
`server/config/firebase-service-account.json` was previously committed to git.
Even though it is now untracked, the old key is exposed in git history.

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project (`minova-ef69c`) → **Project Settings → Service Accounts**.
2. **Delete the old (exposed) key** from the Service Accounts list.
3. Click **Generate new private key** → download the JSON.
4. Keep the new JSON safe — you will upload it as a secret file on Render (Step 1). Never commit it.

### Commit the latest code
```bash
git add -A
git commit -m "Agastya AI: Arun complete, govt-style login, Vercel + Render deploy configs"
git push
```

---

## Step 1 — Backend on Render

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** → connect this repo.
   Render reads `render.yaml` and creates the web service `agastya-ai-server`
   (root `server`, build `npm install`, start `node src/index.js`, health check `/api/health`, free plan).
2. When prompted for the `sync: false` variables:
   - `GROQ_API_KEY` — your Groq API key (required for Arun + AI risk explanations).
   - `CLIENT_URL` — leave a placeholder for now (e.g. `https://placeholder.vercel.app`); you will set the real value in Step 3.
3. **Add the Firebase secret file** (Blueprints cannot carry secret-file contents):
   Service → **Environment → Secret Files** → add file named `firebase-service-account.json`,
   contents = the **new** Firebase JSON from Step 0.
   Render mounts it at `/etc/secrets/firebase-service-account.json` — `render.yaml` already points
   `GOOGLE_APPLICATION_CREDENTIALS` there.
4. Deploy. Note the backend URL, e.g. `https://agastya-ai-server.onrender.com`.
   - Health check: `https://<backend-url>/api/health` should return `{"success":true,...}`.

> Prefer clicking through manually instead of the Blueprint? Create a **Web Service** with
> Root Directory `server`, Build `npm install`, Start `node src/index.js`, and set the same
> environment variables listed in `render.yaml`.

---

## Step 2 — Frontend on Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import this repo.
2. **Leave the Root Directory as the repo root.** The `vercel.json` at the root already tells Vercel:
   install + build inside `client/`, publish `client/dist`, and rewrite all routes to `index.html` (SPA).
   Do **not** point the Root Directory at `client/` — the root `vercel.json` would be ignored.
3. **Environment variable** (Project → Settings → Environment Variables, Production):
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<backend-url>/api` (your Render backend URL + `/api`) |

   ⚠️ `VITE_API_URL` is baked in at **build** time. Set it before the first deploy;
   if you change it later, redeploy the Vercel project.
4. Deploy. Note the production URL, e.g. `https://agastya-ai.vercel.app`.

---

## Step 3 — Wire CORS (backend ← frontend)

1. Render service → **Environment** → set `CLIENT_URL` to the exact Vercel production URL
   (e.g. `https://agastya-ai.vercel.app` — no trailing slash).
2. Save → Render redeploys the backend automatically.

Without this step the dashboard will sit on loading skeletons — the API rejects the
frontend's origin.

> Note: Vercel **preview** deployments get different URLs, and CORS only allows the one
> `CLIENT_URL`. Use the production URL for demos; previews will load the shell but not the data.

---

## Step 4 — Verify

- Open the Vercel URL → splash screen → **login popup** → sign in with the demo credentials
  (`admin` / `admin123`, solve the captcha) → dashboard loads with data (412 mines, 1,284 inspections).
- Open Arun chat → ask "How many mines are monitored?" → should answer 412 from live data.
- The map should show the real OpenStreetMap geography of India with mine clusters.
- Backend logs on Render show `Agastya AI server is running`.

> **Free-tier note:** the Render free web service sleeps after inactivity — the first request
> after idle takes ~30–60s to wake, so the first dashboard load / Arun reply can be slow.
> The Vercel frontend itself never sleeps.

---

## Environment variable reference

| Variable | Where | Required | Purpose |
|---|---|---|---|
| `PORT` | backend (Render) | auto | server port (Render sets it; server reads it, defaults 5000 locally) |
| `CLIENT_URL` | backend (Render) | yes | frontend origin allowed by CORS — exact Vercel production URL |
| `GROQ_API_KEY` | backend (Render) | yes | Arun chatbot + AI risk explanations |
| `GOOGLE_APPLICATION_CREDENTIALS` | backend (Render) | yes | path to Firebase JSON — `/etc/secrets/firebase-service-account.json` (set in `render.yaml`) |
| `NODE_ENV` | backend (Render) | recommended | `production` (set in `render.yaml`) |
| `VITE_API_URL` | frontend (Vercel) | yes | backend base URL + `/api` — build-time, redeploy after changes |

## Troubleshooting

| Symptom | Cause → Fix |
|---|---|
| Dashboard shows skeletons / "backend unreachable" | CORS: `CLIENT_URL` doesn't match the Vercel URL exactly (or has a trailing slash) → fix and let the backend redeploy |
| Arun replies "couldn't respond" / "temporarily unavailable" | `GROQ_API_KEY` missing/invalid, or Groq free-tier rate limit → check backend env + logs; rate limits clear on their own |
| Server crashes on boot: "Firebase service account file not found" | Secret file missing or named wrong → Render → Environment → Secret Files, filename must be `firebase-service-account.json` |
| Data loads but Firestore writes fail | Old Firebase key revoked after rotation → re-download key and update the secret file |
| Vercel build fails (`cd: client: no such file or directory`) | Project Root Directory was set to `client/` → reset it to the repo root so the root `vercel.json` applies |
| Frontend changes not appearing | `VITE_API_URL` is build-time → trigger a redeploy in Vercel after changing it |
| Map is dark without streets | Map tiles blocked by the viewer's ad-blocker/VPN → normal on most networks |
