# Machine Setup Guide (Windows)

A checklist to get a fresh machine ready to work on Detangle. Run through this once, top to bottom, before touching any code. Commands are PowerShell.

## 1. Node.js (frontend)

You mentioned Node was just installed, but it isn't showing up on this machine's PATH yet:

```powershell
node --version
npm --version
```

If either command fails:
1. Close and reopen your terminal/VS Code fully (PATH changes from an installer only apply to new terminal sessions). Try the commands again first.
2. If it's still missing, install the **LTS** version from https://nodejs.org (the installer adds Node to PATH automatically — make sure that checkbox is left on).
3. Reopen the terminal again and re-run the version checks. You should see something like `v22.x.x` for Node and `10.x.x` for npm.

## 2. Git — already installed ✓

Confirmed on this machine: `git version 2.55.0`. Nothing to do here.

## 3. Python (backend) — already installed ✓

Confirmed: `Python 3.13.14`, `pip 26.1.2`. That's plenty recent for Flask. Nothing to do here.

## 4. Database: MongoDB Atlas (recommended over installing MongoDB locally)

Skip installing MongoDB Community Server on this machine. Use **MongoDB Atlas** (hosted MongoDB) instead — it avoids managing a Windows service, and it's what the production deployment will use anyway, so your local setup matches prod from day one.

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create an **Organization** and **Project** (default names are fine, e.g. "Detangle").
3. Create a cluster on the **M0 free tier** (plenty for development).
4. Under **Database Access**, create a database user (username + password — save the password somewhere safe, you'll need it in the connection string).
5. Under **Network Access**, add your current IP (Atlas can detect it for you). If your IP changes often during dev, you can temporarily allow `0.0.0.0/0` (anywhere) — just don't leave that on for a production cluster later.
6. Once the cluster is up, click **Connect → Drivers**, choose Python, and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
   ```
7. You'll paste this into `backend/.env` as `MONGODB_URI` in step 6 below (replace `<username>`/`<password>` with the real values, no angle brackets).

## 5. Recommended editor tooling

If using VS Code:
- **ESLint** extension (matches the project's `eslint.config.js`)
- **MongoDB for VS Code** extension — lets you browse your Atlas cluster's data without leaving the editor
- **Postman** (https://www.postman.com/downloads/) or the VS Code **Thunder Client** extension — for manually testing the Flask API endpoints (`/api/health`, `/api/registrations`) before the frontend is wired up

## 6. Project setup

From the repo root (`Detangle_Website/`):

**Frontend:**
```powershell
npm install
copy .env.example .env
```
Open `.env` and confirm it has:
```
VITE_API_BASE_URL=http://localhost:5000
```

**Backend:**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
Open `backend/.env` and fill in your real Atlas connection string:
```
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=detangle_db
MONGODB_COLLECTION_NAME=registrations
```

## 7. Smoke test — confirm everything is wired up

**Terminal 1 (backend):**
```powershell
cd backend
venv\Scripts\activate
python app.py
```
You should see Flask start on `http://0.0.0.0:5000`.

**Terminal 2 (frontend, from repo root):**
```powershell
npm run dev
```
You should see Vite start on `http://localhost:5173`.

**Then check:**
1. Open http://localhost:5000/api/health in a browser — should return `{"status": "ok"}`.
2. Open http://localhost:5173, go to the Register page, submit a test entry.
3. In MongoDB Atlas, browse to your cluster's `detangle_db.registrations` collection (or via the MongoDB for VS Code extension) and confirm the test document landed there.

If all three work, the machine is fully set up.

## 8. Deploying frontend + backend — what we actually did

*(Superseded an earlier draft of this section that assumed separate Render + Vercel deployments on an `api.` subdomain. Vercel's "Services" project type made that unnecessary — documenting the real setup below.)*

Vercel can detect a repo containing both a Flask app and a Vite app and deploy them as **one project with two services**, using a generated `vercel.json`:

```json
{
  "services": {
    "frontend": { "root": ".", "framework": "vite" },
    "backend": { "root": "backend" }
  },
  "rewrites": [
    { "source": "/api/(.*)?", "destination": { "type": "service", "service": "backend" } },
    { "source": "/(.*)", "destination": { "type": "service", "service": "frontend" } }
  ]
}
```

This means **one domain serves both** — no separate `api.` subdomain, and no separate Render/Railway account needed.

```
Browser
  └─→ https://detangle.in
        ├─ /api/*  → backend service (Flask)
        └─ everything else → frontend service (Vite build)
                 ↓
           MongoDB Atlas (already set up in step 4)
```

**Steps taken:**
1. Push the repo to GitHub (done — `ZeNeXOP/Detangle_Website`).
2. In Vercel, **New Project → Import from GitHub**, select the repo.
3. **Application Preset: Services.** Select *both* the `backend` (Flask) and `frontend` (Vite) service cards — both must be individually selected or Deploy stays disabled.
4. Accept the generated `vercel.json` as-is.
5. Under **Environment Variables**, set:
   - Backend: `MONGODB_URI`, `MONGODB_DB_NAME=detangle_db`, `MONGODB_COLLECTION_NAME=registrations`, `FRONTEND_ORIGIN` (the production domain).
   - Frontend: `VITE_API_BASE_URL` set to an **explicit empty string** (`""`), not left unset — since frontend and backend now share one origin, the app calls `/api/registrations` as a relative path instead of a full cross-origin URL. Leaving it unset would fall back to `http://localhost:5000` in production.
6. Deploy, then verify on the temporary `*.vercel.app` URL before adding the custom domain: homepage loads, `/api/health` returns `{"status":"ok"}`, and a real test registration lands in Atlas.

## 9. `detangle.in` — registered and pointed at the deployment

- Registered `detangle.in` (`.in` has no residency restriction, so any ICANN-accredited registrar works — Cloudflare Registrar/Namecheap are both fine choices).
- Added it as the project's domain in Vercel and pointed DNS at Vercel per Vercel's own instructions for the domain (a single apex + `www` record — no `api` subdomain needed, since `/api/*` is handled by the rewrite above on the same domain). Vercel auto-provisions HTTPS once DNS resolves.
- Updated `FRONTEND_ORIGIN` (backend env var) to `https://detangle.in` and redeployed.

**Status: live at `https://detangle.in`.** Next: a production smoke test (see the top-level plan) before starting the backend/data-model rebuild.

## 10. Accounts to create later (not needed today)

These belong to the bigger refactor roadmap (notifications) and aren't required to start developing locally or even to do the initial deploy above:

- **Resend** — transactional email for booking notifications.
- **Twilio (WhatsApp Business API) + Meta Business verification** — for automated WhatsApp notifications. **Start this one early if/when you get to it** — Meta's business verification and message template approval can take several days, and it shouldn't hold up the rest of the build.

Neither blocks local development or the domain/deploy steps above — they only matter once we get to the notifications phase of the roadmap.
