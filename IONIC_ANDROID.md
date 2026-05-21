# CarLast Ionic Android Build

This repository contains the Ionic React + Capacitor mobile app in `src/`.
The Next.js web app, Vercel API routes, and Sanity Studio live in the separate
Next.js repository.

## Required Environment

Create a local `.env` file for the mobile app with:

```bash
VITE_SANITY_PROJECT_ID=bushe0bq
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2022-03-10
VITE_RENT_API_URL=https://carlast.vercel.app/api/submit-rent
```

Do not put a Sanity write token inside the Ionic app. Rent applications go
through the deployed Next.js endpoint at `https://carlast.vercel.app/api/submit-rent`,
which uploads the certificate, creates a `userForms` document in Sanity, and
sends the email. Catalog data can load without a token if the dataset allows
public reads.

Set these variables in Vercel for the Next.js serverless endpoint, not in this
mobile repository:

```bash
SANITY_PROJECT_ID=bushe0bq
SANITY_DATASET=production
SANITY_API_VERSION=2022-03-10
SANITY_WRITE_TOKEN=your_sanity_write_token
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
APP_ORIGIN=https://carlast.vercel.app
```

Sanity must allow the web origins used by Ionic/Capacitor. In Sanity Manage,
open the `bushe0bq` project, go to API > CORS origins, and add:

```text
http://localhost:5173
http://127.0.0.1:5173
https://localhost
capacitor://localhost
```

Enable credentials for the origins if you use a browser-exposed token.

## Local Development

```bash
npm install
npm run dev
```

## Build and Sync Android

```bash
npm run build
npx cap sync android
```

## Generate a Debug APK

```bash
cd android
.\gradlew.bat assembleDebug
```

The generated debug APK is:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

This APK is installable on an Android device with USB debugging enabled:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Generate a Release APK

Open Android Studio with:

```bash
npx cap open android
```

Then use Android Studio:

```text
Build > Generate Signed Bundle / APK > APK
```

Create or choose a keystore, select the `release` build variant, and finish the
wizard. Android Studio will produce a signed APK suitable for device install.

## Current Mobile Scope

- Home page loads banner, sale cars, rent cars, and footer banner from Sanity.
- Sale detail pages support adding vehicles to the in-app cart.
- Rent detail pages submit applications to the serverless API, which writes to Sanity `userForms`.
- Cart and checkout screens are Ionic-native client screens.

Stripe checkout and Auth0 login were Next API/browser flows in the original app.
For production mobile payments and authentication, add hosted endpoints or
mobile-native provider flows before taking live payments.
