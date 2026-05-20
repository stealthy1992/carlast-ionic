# Appium Test Setup

This project keeps Appium tests separate from the existing Playwright tests.
The Appium suite lives under:

```text
tests/appium/
```

## Files

```text
wdio.appium.conf.js
tests/appium/specs/rent-flow.spec.js
tests/appium/page-objects/BasePage.js
tests/appium/page-objects/HomePage.js
tests/appium/page-objects/RentDetailsPage.js
```

All test files use CommonJS:

```js
const { describe, it } = require('mocha')
const assert = require('assert')
const HomePage = require('../page-objects/HomePage')
```

WebdriverIO/Appium globals such as `browser` and `$` are provided by the WDIO
runner at runtime.

## Prerequisites

You already have Appium and the UiAutomator2 driver installed globally. Verify:

```bash
appium -v
appium driver list --installed
```

The installed driver list should include `uiautomator2`.

## Build the APK

You do not need to rebuild just because you added Appium tests. Appium tests run
against an APK. Rebuild only when app source, env variables, Capacitor config,
or Android files change.

To rebuild the debug APK:

```bash
npm run android:debug-apk
```

The default APK path used by WDIO is:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Override it if needed:

```bash
$env:APPIUM_APK_PATH="C:\path\to\app-debug.apk"
```

## Configure Your AVD

List local AVD names:

```bash
emulator -list-avds
```

Set your AVD name before running tests:

```bash
$env:APPIUM_AVD_NAME="Your_AVD_Name"
```

If your emulator is already running, you can omit `APPIUM_AVD_NAME` and WDIO
will connect through Appium to the available Android device/emulator.

Optional variables:

```bash
$env:APPIUM_DEVICE_NAME="Android Emulator"
$env:APPIUM_HOST="127.0.0.1"
$env:APPIUM_PORT="4723"
$env:APPIUM_BASE_PATH="/"
```

## Run Locally

Start Appium in one terminal:

```bash
appium
```

In another terminal:

```bash
npm run test:appium
```

The initial smoke test launches the app, switches into the Ionic WebView,
verifies the Sanity-backed catalog headings, opens the first rent car, and
checks that the rent modal appears.
