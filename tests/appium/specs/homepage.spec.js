const { expect } = require('chai')
const HomePage = require('../page-objects/HomePage')
const BasePage = require('../page-objects/BasePage')
const contextHelper = require('../helpers/contextHelper')
const DetailPage = require('../page-objects/DetailPage')
const CartSlider = require('../page-objects/CartSlider')
const path = require('path');
const { fetchCarsForSale, fetchCarsForRent } = require('../helpers/sanityHelper');


describe('Homepage Functionality Tests', () => {

    let carsForSale, carsForRent;

    beforeEach(async () => {
        // Wait for app to stabilize
        await browser.pause(1000)
        await BasePage.initWebView();
        await contextHelper.logCurrentContext();
        carsForSale = await fetchCarsForSale();
        carsForRent = await fetchCarsForRent();

    })
    
    it.skip('App should initialize and browser should be available', async () => {
        // Verify WebdriverIO/Appium globals are available
        expect(browser).to.exist
        expect(browser.capabilities).to.exist
        expect(browser.capabilities.platformName).to.equal('Android')
        await driver.pause(10000)
    })

    it('This will test all the sale/rent cars are as per Sanity studio', async () => {
        let saleCarsNames = [];
        let rentCarsNames = [];
        const [ saleCars, rentCars ] = await HomePage.fetchAllCars();

        for (let car of carsForSale){
            saleCarsNames.push(car.name);
        }
        for(let car of carsForRent){
            rentCarsNames.push(car.name);
        }

        for(let car of saleCars){
            expect(saleCarsNames).to.include(car);     
        }

        for(let car of rentCars){
            expect(rentCarsNames).to.include(car);
        }

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

    it.skip('This will tap on a car-for-rent, and will click the rent pop up button', async () => {

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

    // it('This will make GROQ query request to Sanity to fetch car names', async () => {

    //     const response = await fetch(
    //         `https://${VITE_SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/production` +
    //         `?query=${encodeURIComponent('*[_type == "carsforsale"]{ name }')}`
    //     );
    //     const { result } = await response.json();
    // })
})