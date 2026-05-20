const path = require('path')

exports.config = {
  runner: 'local',
  specs: ['./tests/appium/specs/**/*.spec.js'],
  maxInstances: 1,

  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  reporters: ['spec'],

  // ── Appium service — manages Appium server process automatically ──────────
  services: [
    ['appium', {
      command: 'appium',
      args: {
        relaxedSecurity: true,
        log:             './appium.log',
        port:            4723,
      },
    }],
  ],

  capabilities: [
    {
      platformName:                           'Android',
      'appium:deviceName':                    'emulator-5554',
      'appium:platformVersion':               '11',
      'appium:automationName':                'UiAutomator2',
      'appium:app': path.join(
        __dirname, '..', '..', 'android', 'app',
        'build', 'outputs', 'apk', 'debug', 'app-debug.apk'
      ),
      'appium:appPackage':                    'com.carlast.app',
      'appium:appActivity':                   '.MainActivity',
      'appium:appWaitActivity':               '.MainActivity',
      'appium:appWaitDuration':               20000,

      // Clean start every run
      'appium:noReset':                       false,
      'appium:fullReset':                     false,
      'appium:forceAppLaunch':                true,
      'appium:autoGrantPermissions':          true,

      // Timeouts adjusted for lighter AVD
      'appium:newCommandTimeout':             120,
      'appium:androidInstallTimeout':         60000,
      'appium:uiautomator2ServerLaunchTimeout': 30000,
      'appium:uiautomator2ServerInstallTimeout': 30000,

      // WebView — now pointing to Chromedriver 96 to match WebView 96.0.4664.45
      'appium:autoWebview':                   true,
      'appium:chromedriverAutodownload':      false,
      'appium:chromedriverExecutable': path.join(
        __dirname,
        'chromedriver',
        'chromedriver96',   // ← updated from chromedriver83 to chromedriver96
        'chromedriver.exe'
      ),
      'appium:chromedriverDisableBuildCheck': true,
    },
  ],

  // ── Push test assets to AVD before any tests run ─────────────────────────
  onPrepare() {
      const { execSync } = require('child_process');
      const path = require('path');

      // __dirname = D:\carlast_app\tests\appium
      // assets is a sibling folder of wdio.appium.conf.js
      const localPath = path.resolve(__dirname, './assets/uploadImage.jpg');

      console.log('[Setup] Pushing from:', localPath);

      try {
          execSync(`adb push "${localPath}" /sdcard/Pictures/uploadImage.jpg`);
          console.log('[Setup] Image pushed to AVD successfully');
      } catch (e) {
          console.warn('[Setup] adb push failed:', e.message);
      }
  },

}