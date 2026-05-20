const BasePage = require('../page-objects/BasePage');
const contextHelper = require('../helpers/contextHelper');


class CartSlider{

    static async checkSliderContent(){

        const toolbar = await BasePage.getActivePageElement('ion-toolbar');
        await toolbar.waitForDisplayed({timeout: 2000});
        const cartButton = await toolbar.$('ion-buttons ion-button[aria-label="Cart"]');
        const cartCounter = await toolbar.$('ion-buttons ion-button ion-badge');
        const cartCounterValue = await cartCounter.getText();
        console.log('Item count is: ',cartCounterValue);
        await cartButton.click();

        await driver.pause(2000);

        const cartContent = await BasePage.getActivePageElement('.screen.narrow-screen');
        await cartContent.waitForDisplayed({timeout: 3000});
        const cartText = await cartContent.getText();
        return [ cartText, cartCounterValue ];

    }

    static async emptyCart(){

        const emptyCartButton = await $('ion-button=Empty Cart');
        await emptyCartButton.click();

        const cartContent = await BasePage.getActivePageElement('.screen.narrow-screen');
        await cartContent.waitForDisplayed({timeout: 3000});
        const cartText = await cartContent.getText();
        const browseButton = await $('ion-button=Browse Cars');
        await browseButton.click();
        await BasePage.waitForPageLoad();
        await driver.pause(2000);
        return cartText;
        // console.log('Cart text after emptying it is: ',cartText);
    }

    // static async checkCartItemCount(){

    //     const toolbar = await $('ion-toolbar');
    //     await toolbar.waitForDisplayed({timeout: 2000});
    //     const cartCounter = await toolbar.$('ion-buttons ion-button ion-badge');
    //     const cartCounterValue = await cartCounter.getText();
    //     console.log('Item count is: ',cartCounterValue);

    // }
}

module.exports = CartSlider;