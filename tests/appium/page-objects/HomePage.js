const BasePage = require('../page-objects/BasePage');
const contextHelper = require('../helpers/contextHelper');

class HomePage extends BasePage{

    
    static async fetchAllCars(){

        let saleCars = [];
        let rentCars = [];
        const carSections = await $$('.catalog-section');
         for(let section of carSections){
            const sectionID = await section.getAttribute('id');
            const carCards = await section.$$('ion-card');
            for( let card of carCards){
                if(sectionID && sectionID === 'sale-cars'){
                    const cardHeader = await card.$('ion-card-header');
                    const cardTitle = await cardHeader.$('ion-card-title');
                    const text = await cardTitle.getText();
                    saleCars.push(text)
                }
                else{
                    const cardHeader = await card.$('ion-card-header');
                    const cardTitle = await cardHeader.$('ion-card-title');
                    const text = await cardTitle.getText();
                    rentCars.push(text)
                }            
            }
         }

         return [ saleCars, rentCars ];

    }
    
    static async tapCar(carName){
     

        
        const carSections = await $$('.catalog-section');

        for(let section of carSections){

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