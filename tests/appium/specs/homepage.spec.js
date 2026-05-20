const { expect } = require('chai')
const HomePage = require('../page-objects/HomePage')
const BasePage = require('../page-objects/BasePage')
const contextHelper = require('../helpers/contextHelper')
const DetailPage = require('../page-objects/DetailPage')
const CartSlider = require('../page-objects/CartSlider')
const path = require('path');


describe('Homepage Functionality Tests', () => {

    beforeEach(async () => {
        // Wait for app to stabilize
        await browser.pause(1000)
        await BasePage.initWebView();
        await contextHelper.logCurrentContext();
    })
    
    it.skip('App should initialize and browser should be available', async () => {
        // Verify WebdriverIO/Appium globals are available
        expect(browser).to.exist
        expect(browser.capabilities).to.exist
        expect(browser.capabilities.platformName).to.equal('Android')
        await driver.pause(10000)
    })
    
    it.skip('This will test all the cars for sale are displaying on homepage', async () => {
        // TODO: Implement car listing test
        await HomePage.tapCar('Daihatsu Moving');
    })

    it.skip('Will check the correct car loaded in detail view and will add it to cart.', async () => {

        const carName = await DetailPage.verifyCarDetails('Daihatsu Moving');
        expect(carName).to.equal('Daihatsu Moving');
        await DetailPage.applyForPurchase();
    })

    it.skip('Will check if the drawer opens on clicking cart and check if the same car is listed there', async () => {

        const [ cartContent, carCount ] = await CartSlider.checkSliderContent();
        expect(cartContent).to.include('Your Cart');
        expect(Number(carCount)).to.equal(1);

        const emptyCartMsg = await CartSlider.emptyCart();
        expect(emptyCartMsg).to.include('No vehicles in the cart');
        
    })

    it('This will tap on a car-for-rent, and will click the rent pop up button', async () => {

        await HomePage.tapCar('NIO EP6');
        await driver.pause(2000);
        const carName = await DetailPage.verifyCarDetails('NIO EP6');
        expect(carName).to.equal('NIO EP6');

        await DetailPage.applyForRent(
            'input[type="file"]',
            path.resolve(__dirname, '../assets/uploadImage.jpg'), // Windows path
            '/sdcard/Pictures/uploadImage.jpg'  // AVD path (for adb push only)
        );

    })

    // it('should upload a profile image', async () => {
        
    //     await BasePage.switchToWebView();
        
    //     // Use Option 2 — bypass native picker entirely
    //     await BasePage.uploadFileInWebView(
    //         'input[type="file"]',
    //         '/sdcard/Pictures/uploadImage.jpg'
    //     );

    //     // Verify upload was accepted — check preview or filename display
    //     const preview = await BasePage.getActivePageElement('img.upload-preview');
    //     await expect(preview).toBeDisplayed();
    // });
})