const BasePage = require('../page-objects/BasePage');
const contextHelper = require('../helpers/contextHelper');
const { reverse } = require('node:dns');

class DetailPage extends BasePage {

    static async verifyCarDetails(carName){

        await BasePage.switchToWebView();
        await contextHelper.logCurrentContext();

        const h1 = await BasePage.getActivePageElement('h1');
        await h1.waitForDisplayed({ timeout: 10000 });

        const text = await h1.getText();
        return text;

    }

    static async applyForPurchase(){

        const button = await $('ion-button=Place Order');
        await button.waitForDisplayed({ timeout: 2000 });
        await button.click();
        await driver.pause(2000);
        const alert = await $('ion-alert[is-open="true"]');
        await alert.waitForDisplayed({ timeout: 2000 });

        const confirmButton = await alert.$('button=OK');
        await confirmButton.click();

        await driver.waitUntil(async () => {
            const openAlert = await $('ion-alert[is-open="true"]');
            return !(await openAlert.isExisting());
        }, {
            timeout: 5000,
            timeoutMsg: 'Alert was not dismissed after clicking OK'
        });

        await driver.pause(2000)
    }

    static async applyForRent(fileInputSelector, localFilePath, avdFilePath){

        const button = await $('ion-button=Apply for Rent');
        await button.waitForDisplayed({ timeout: 2000 });
        await button.click();
        await driver.pause(1000);

        const popup = await $('ion-modal[is-open="true"]');
        await popup.waitForDisplayed({timeout: 2000});

        const form = await popup.$('form');
        // await form.waitForDisplayed({timeout: 2000})
        const inputs = await form.$$('ion-input');
        const name = await inputs[0];
        const nativeInput = await name.$('input.native-input');

        // Now setValue works correctly
        await nativeInput.click();
        await nativeInput.setValue('Latest Appium User');
        await driver.pause(2000);

        const email = await inputs[1];
        const nativeEmail = await email.$('input.native-input');
        await nativeEmail.click();
        await nativeEmail.setValue('rehmanhere2k19@gmail.com');
        await driver.pause(1000);

        const rentDays = await form.$('ion-select');
        await rentDays.click();
        await driver.pause(2000);

        const alert = await $('ion-alert');
        await alert.waitForExist({timeout: 2000});
        const radioButtons = await $$('button[role="radio"]')
       

        for(let option of radioButtons){

            await option.waitForDisplayed({timeout: 2000});
            const optionText = await option.getText();
            if(optionText.trim() === "2"){
                await option.click();
                break;
            }
        }

        // await option.click();
        await driver.pause(1000);
        const actionButtons = await $$('.alert-button-group button');
        const buttonLength = await actionButtons.length;
        // console.log('action button count is: ',buttonLength)
        for(let button of actionButtons){
            await button.waitForExist({timeout: 2000});
            const buttonText = await button.getText();
            if(buttonText == "OK"){
                await button.click();
                break;
            }
        }

        await BasePage.switchToWebView();
        await driver.pause(1000);

        const fileUpload = await $('input[type="file"]');
        await fileUpload.waitForExist({ timeout: 5000 });

        // Make input visible
        await driver.execute((inputElement) => {
            inputElement.style.display  = 'block';
            inputElement.style.opacity  = '1';
            inputElement.style.position = 'fixed';
            inputElement.style.width    = '100px';
            inputElement.style.height   = '100px';
            inputElement.style.zIndex   = '9999';
        }, fileUpload);

        // Read file from AVD storage and inject via JavaScript
        // This completely bypasses setValue and never touches the native file picker
        const { execSync } = require('child_process');

        // Pull file from AVD as base64
        const base64 = execSync(
            'adb shell "base64 -w 0 /sdcard/Pictures/uploadImage.jpg"'
        ).toString().trim();

        console.log('[File Upload] Base64 length:', base64.length);

        // Inject file directly into input via DataTransfer
        const injectionResult = await driver.execute((b64data, filename) => {
            try {
                const input = document.querySelector('input[type="file"]');
                if (!input) return { success: false, error: 'input not found' };

                // Convert base64 to blob
                const byteChars = atob(b64data);
                const byteNums  = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteNums[i] = byteChars.charCodeAt(i);
                }
                const blob = new Blob([byteNums], { type: 'image/jpeg' });
                const file = new File([blob], filename, { type: 'image/jpeg' });

                // Inject via DataTransfer
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;

                // Trigger events so app knows file was selected
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('input',  { bubbles: true }));

                return {
                    success:   true,
                    hasFiles:  input.files.length > 0,
                    fileName:  input.files[0].name,
                };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }, base64, 'uploadImage.jpg');

        console.log('[File Upload] Injection result:', injectionResult);

        // Verify
        expect(injectionResult.success).toBe(true);
        expect(injectionResult.hasFiles).toBe(true);
        expect(injectionResult.fileName).toBe('uploadImage.jpg');

        await driver.waitUntil(async () => {
            const submitBtn = await $('ion-button[type="submit"]');
            const isDisabled = await submitBtn.getAttribute('aria-disabled');
            return isDisabled === 'false' || isDisabled === null;
        }, {
            timeout: 10000,
            timeoutMsg: 'Submit button never became enabled — one or more fields may be invalid'
        });

        await driver.execute(() => {
            // Override fetch to log all API calls
            const originalFetch = window.fetch;
                window.fetch = async (...args) => {
                    console.log('[API CALL]', args[0]);
                    const response = await originalFetch(...args);
                    console.log('[API RESPONSE]', response.status, args[0]);
                    return response;
                };
        });

        const popupClosure = await $('ion-modal[is-open="true"]');
        
        const submitBtn = await $('ion-button[type="submit"]');
        await submitBtn.click();
        await driver.pause(5000);
        // const logs = await driver.getLogs('browser');
        // logs.forEach(log => console.log('[Browser Log]', log.message));
        const submissionLog = await DetailPage.waitForSubmissionToFinish()
        console.log('[Submission Log]', submissionLog);

        await popupClosure.waitForDisplayed({ reverse: true, timeout: 5000 });

        // const dialogueAlert = await $('div=Your rent application was submitted to Sanity.');
        const dialogueAlerts = await $$('.alert-wrapper');

        for( let dialogueAlert of dialogueAlerts){
            const dialogueMsg = await dialogueAlert.$('.alert-message');
            // await dialogueMsg.waitForDisplayed({timeout: 5000});
            const messageText = await dialogueMsg.getText();
            if(messageText.includes('rent application was submitted')){

                console.log('Entered here in right')
                const buttonGroup = await dialogueAlert.$('.alert-button-group');
                const button = await buttonGroup.$('button');
                await button.waitForDisplayed({timeout: 2000})
                await button.click();
                break;
            }
        }

        await driver.pause(2000);

    }

    static async waitForSubmissionToFinish() {
        return await BasePage.waitForBrowserLogContaining('[RENT SUBMISSION]', 120000);
    }
}

module.exports = DetailPage;