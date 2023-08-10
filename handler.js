'use strict';
const server = require("./backend/server");
const severless = require("serverless-http")

module.exports.rajdev = severless(server);