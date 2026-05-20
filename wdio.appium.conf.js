const path = require('path')

const appiumConfig = require('./tests/appium/wdio.appium.conf.js')

exports.config = appiumConfig.config || appiumConfig
