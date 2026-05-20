const BasePage = require('../page-objects/BasePage');
const contextHelper = require('../helpers/contextHelper');

class HomePage extends BasePage{

    static async tapCar(carName){
     
        // await contextHelper.logCurrentContext();
        // const carCards = await $$('#sale-cars ion-card');
        // for(let card of carCards){

        //     const cardHeader = await card.$('ion-card-header');
        //     const cardTitle = await cardHeader.$('ion-card-title');
        //     const text = await cardTitle.getText();
        //     if(text.includes(carName)){
        //         const button = await card.$('ion-button');
        //         await button.click();
        //         await BasePage.waitForPageLoad();
        //         break;
        //     }
        // }

        // await contextHelper.logCurrentContext();
        const carSections = await $$('.catalog-section');
        // await carSections.waitForDisplayed({timeout: 2000});

        for(let section of carSections){

            // const sectionHeading = await section.$('h2');
            // const headingText = await sectionHeading.getText();
            const carCards = await section.$$('ion-card');

            for( let card of carCards){

                const cardHeader = await card.$('ion-card-header');
                const cardTitle = await cardHeader.$('ion-card-title');
                const text = await cardTitle.getText();

                if(text.includes(carName)){

                    const button = await card.$('ion-button');
                    await button.click();
                    await BasePage.waitForPageLoad();
                    break;
                }

            }
        }
    }
}

module.exports=HomePage;