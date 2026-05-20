// test/pages/BasePage.js
const contextHelper = require('../helpers/contextHelper');

class BasePage {

    // ─── Context Management ───────────────────────────────────────────────────

    static async switchToWebView() {
        // Wait for the WebView context to be available
        await driver.waitUntil(async () => {
            const contexts = await driver.getContexts();
            return contexts.some(c => c.includes('WEBVIEW'));
        }, { timeout: 10000, timeoutMsg: 'WebView context never appeared' });

        const contexts = await driver.getContexts();
        const webviewContext = contexts.find(c => c.includes('WEBVIEW'));
        await driver.switchContext(webviewContext);
    }

    static async getActivePageElement(cssSelector) {
        await driver.waitUntil(async () => {
            const transitioning = await $$(
                '.ion-page.ion-page-will-enter, .ion-page.ion-page-will-leave'
            );
            return transitioning.length === 0;
        }, { timeout: 5000, timeoutMsg: 'Page transition never settled' });

        const isDetailPage = await $(
            '.ion-page.can-go-back:not(.ion-page-hidden)'
        ).isExisting();

        const scope = isDetailPage
            ? '.ion-page.can-go-back:not(.ion-page-hidden) '
            : '.ion-page:not(.can-go-back):not(.ion-page-hidden) ';

        return await $(scope + cssSelector);
    }

    static async switchToNative() {
        await contextHelper.switchToNative();
    }

    static async getCurrentContext() {
        return await driver.getContext();
    }

    static async  uploadFileInWebView(fileInputSelector, remoteFilePath) {
        // Switch to WebView context
        await BasePage.switchToWebView();

        // Make the file input interactable — Ionic/web apps often hide it
        await driver.execute((selector) => {
            const input = document.querySelector(selector);
            if (input) {
                input.style.display = 'block';
                input.style.opacity = '1';
                input.style.position = 'fixed';
                input.style.zIndex = '9999';
            }
        }, fileInputSelector);

        // Set the file path directly — this works in WebView/Chromedriver context
        const fileInput = await $(fileInputSelector);
        await fileInput.setValue(remoteFilePath);
    }

    // ─── Wait for app's WebView to initialize ─────────────────────────────────
    // Call this ONLY after native interactions are complete (e.g. after SKIP)
    static async waitForPageLoad(timeout = 15000) {
        await driver.waitUntil(
            async () => {
                const contexts = await driver.getContexts();
                return contexts.some(c => c.startsWith('WEBVIEW'));
            },
            {
                timeout,
                timeoutMsg: 'WebView context never became available — app may not have loaded'
            }
        );
        console.log('WebView is available and ready');
    }

    static async initWebView(waitMs = 4000) {
        await driver.pause(waitMs);
        const contexts = await driver.getContexts();
        console.log('Available contexts:', contexts);
        const webview = contexts.find(c => c.startsWith('WEBVIEW'));
        if (!webview) {
            throw new Error(`No WebView found. Contexts: ${JSON.stringify(contexts)}`);
        }
        await driver.switchContext(webview);
        console.log('Switched to WebView:', webview);
    }

    // ─── Native Element Helpers ───────────────────────────────────────────────
    // Use these for elements identified via Appium Inspector (android= selectors)

    static async waitForNativeElement(selector, timeout = 10000) {
        await contextHelper.ensureNativeContext();
        const el = await $(selector);
        await el.waitForDisplayed({ timeout });
        return el;
    }

    static async tapNativeElement(selector) {
        const el = await this.waitForNativeElement(selector);
        await el.click();
    }

    static async getNativeElementText(selector) {
        const el = await this.waitForNativeElement(selector);
        return await el.getText();
    }

    // ─── WebView Element Helpers ──────────────────────────────────────────────
    // Use these AFTER switchToWebView() for CSS/ion- selectors

    static async waitForWebElement(selector, timeout = 10000) {
        await contextHelper.ensureWebViewContext();
        const el = await $(selector);
        await el.waitForDisplayed({ timeout });
        return el;
    }

    static async tapWebElement(selector) {
        const el = await this.waitForWebElement(selector);
        await el.click();
    }

    static async getWebElementText(selector) {
        const el = await this.waitForWebElement(selector);
        return await el.getText();
    }

    static async typeIntoWebField(selector, value) {
        const el = await this.waitForWebElement(selector);
        await el.clearValue();
        await el.setValue(value);
    }

    static async waitForBrowserLogContaining(text, timeout = 90000) {
        let matchedLog = null

        await browser.waitUntil(
        async () => {
            const logs = await browser.getLogs('browser')
            matchedLog = logs.find((entry) => String(entry.message).includes(text))
            return Boolean(matchedLog)
        },
        {
            timeout,
            interval: 2000,
            timeoutMsg: `Timed out waiting for browser log containing "${text}"`,
        },
        )

        return matchedLog
    }
}

module.exports = BasePage;