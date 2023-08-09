'use strict';
const app = require("./backend/app");
const severless = require("serverless-http")

module.exports.devRaj = severless(app);