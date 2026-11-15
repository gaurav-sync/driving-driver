# Local Drivers

Monorepo for the Local Driver Directory MVP (Android + REST API).

## Structure

| Folder   | Purpose                                      |
| -------- | -------------------------------------------- |
| `server/` | Node.js + Express + TypeScript REST API      |
| `app/`    | React Native (Expo) Android app                |

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas free cluster (or local `mongod`)
- Google Cloud OAuth (Web + Android clients)
- Optional: Cloudinary free tier for vehicle photos
- Android: Expo Go for dev, or EAS for APK

## Setup

```bash
cd "/path/to/local drivers"
npm install

cp server/.env.example server/.env
cp app/.env.example app/.env
```

### Server `.env` (required)

- `MONGODB_URI`, `JWT_SECRET` (≥16 chars), `GOOGLE_CLIENT_ID` (Web client ID)
- Optional: `CLOUDINARY_*`, `ADMIN_EMAILS` (comma-separated → admin on first sign-up)

### App `.env`

- `EXPO_PUBLIC_API_URL` — emulator: `http://10.0.2.2:3000`; device: your PC LAN IP
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Scripts (repo root)

| Command | Description |
| -------- | ------------- |
| `npm run dev:server` | API with hot reload |
| `npm run start:app` | Expo dev server |
| `npm run typecheck` | TypeScript all workspaces |
| `npm run lint` | ESLint |
| `npm run seed:places -w server` | Import places CSV |
| `npm run build -w server` | Compile API + copy `admin/` |

## Automated checks (run locally)

```bash
npm run typecheck && npm run lint && npm run build -w server
```

## Places seed

```bash
npm run seed:places -w server
curl -s "http://localhost:3000/api/places?q=karm"
```

## Admin web UI

With the API running: open `http://localhost:3000/admin/` — paste an **admin JWT**, load pending drivers and reports, approve/reject/resolve.

## Deploy API (Render free tier)

1. Push repo to GitHub; connect Render **Blueprint** from `render.yaml` or create a Web Service with root `server`, build `npm install && npm run build`, start `npm run start`.
2. Set env vars in Render dashboard (same as `server/.env.example`).
3. Atlas: allow access from `0.0.0.0/0` or Render egress IPs.
4. Point app `EXPO_PUBLIC_API_URL` at the Render URL.

## Android APK (EAS)

```bash
cd app
npm i -g eas-cli   # once
eas login
eas build:configure
# Set EXPO_PUBLIC_API_URL to production API in EAS secrets or eas.json env
eas build -p android --profile preview
```

`app/eas.json` defines an **APK** `preview` profile for sideloading to drivers in Karmala.

## Build order status (MVP)

1. Monorepo, TypeScript, lint, env — **done**
2. Models, places seed, search — **done**
3. Google auth, JWT, `/me` — **done**
4. Driver profiles, uploads, search — **done**
5. Admin API, reports — **done**
6. App auth & navigation — **done**
7. Customer search, call, report — **done**
8. Driver registration stepper & home — **done**
9. Admin page, i18n (en/mr/hi), error/retry states — **done**
10. Deploy config + EAS APK profile — **done**

## Manual test checklist

- [ ] Seed places, start API, health OK
- [ ] Customer: Google sign-in → search Karmala → approved driver → Call opens dialer
- [ ] Driver: register 6-step profile → pending on home → admin approve → appears in search
- [ ] Customer report; admin sees flagged at 3+ open reports
- [ ] Photos upload when `CLOUDINARY_*` set
- [ ] Language: English / मराठी / हिंदी on welcome & search

Never commit `.env` files.