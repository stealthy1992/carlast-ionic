// test/helpers/contextHelper.js
const contextHelper = {

    async getAllContexts() {
        return await driver.getContexts();
    },

    async switchToWebView(timeout = 15000) {
        // Wait for WebView to become available before switching
        // Ionic apps take a moment to initialize the WebView
        await driver.waitUntil(
            async () => {
                const contexts = await driver.getContexts();
                return contexts.some(c => c.startsWith('WEBVIEW'));
            },
            {
                timeout,
                timeoutMsg: `WebView context never became available within ${timeout}ms`
            }
        );

        const contexts = await driver.getContexts();
        console.log('Available contexts:', contexts);

        const webview = contexts.find(c => c.startsWith('WEBVIEW'));
        await driver.switchContext(webview);
        console.log(`Switched to: ${webview}`);
    },

    async switchToNative() {
        await driver.switchContext('NATIVE_APP');
        console.log('Switched to: NATIVE_APP');
    },

    async isInWebView() {
        const ctx = await driver.getContext();
        return ctx.startsWith('WEBVIEW');
    },

    async isInNative() {
        const ctx = await driver.getContext();
        return ctx === 'NATIVE_APP';
    },

    async logCurrentContext() {
        const ctx = await driver.getContext();
        console.log('Current context:', ctx);
        return ctx;
    },

    // Ensure you are in native before interacting with native elements
    async ensureNativeContext() {
        const ctx = await driver.getContext();
        if (ctx !== 'NATIVE_APP') {
            await driver.switchContext('NATIVE_APP');
            console.log('Switched back to NATIVE_APP');
        } else {
            console.log('Already in NATIVE_APP context');
        }
    },

    // Ensure you are in WebView before interacting with web elements
    async ensureWebViewContext(timeout = 15000) {
        const ctx = await driver.getContext();
        if (!ctx.startsWith('WEBVIEW')) {
            console.log('Not in WebView — switching now...');
            await this.switchToWebView(timeout);
        } else {
            console.log(`Already in WebView context: ${ctx}`);
        }
    }
};

module.exports = contextHelper;