# Deploy API + build APK

You need: **MongoDB Atlas**, **Google OAuth**, **Render** (free), **Expo** (free).

## 1. MongoDB Atlas

1. Create free cluster → Database Access user → Network Access `0.0.0.0/0` (or Render IPs).
2. Copy connection string → `MONGODB_URI`.

## 2a. Deploy API on Render (recommended)

Long-running Node + MongoDB fits Render better than Vercel serverless.

## 2b. Deploy API on Vercel (optional)

Set **Root Directory** = `server` in the Vercel project. Add env vars: `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `ADMIN_EMAILS` (required at cold start). Open `/health` then `/admin/`.

## 2. Deploy API on Render

1. Push this repo to **GitHub** (private is fine).
2. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint** → connect repo → apply `render.yaml`.
3. When prompted, set:
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID` (Web client ID — same as backend auth)
   - `ADMIN_EMAILS` (your email for admin role)
   - Optional: `CLOUDINARY_*` for driver photos
4. Wait for deploy; open `https://YOUR-SERVICE.onrender.com/health` → `ok: true`.
5. **Seed places once** (local machine):

```bash
MONGODB_URI='your-atlas-uri' npm run seed:places -w server
```

6. Admin UI: `https://YOUR-SERVICE.onrender.com/admin/`

## 3. Google OAuth for production APK

In Google Cloud Console → Credentials:

- **Web client** → used by API `GOOGLE_CLIENT_ID` and app `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- **Android client** → package name `com.localdrivers.karmala`, add SHA-1 from EAS credentials after first build

## 4. Build APK (recommended: EAS)

On your Mac:

```bash
npm i -g eas-cli
eas login
cd app
eas init   # links Expo project, writes projectId to app.config.ts / app.json
```

Create `app/.env` for the build:

```env
EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=....apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=....apps.googleusercontent.com
```

Build APK:

```bash
cd app
eas build -p android --profile preview
```

When finished, download the **.apk** from the Expo dashboard link.

### GitHub Actions (optional)

Repo secrets: `EXPO_TOKEN`, `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`.  
Run workflow **Build Android APK** and pass your Render URL.

## 5. After install

- Open app → sign in with Google (use a test account).
- Drivers: register → approve via `/admin/` → search as customer.

## Local-only APK (advanced)

Requires Android Studio SDK:

```bash
cd app
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/
```