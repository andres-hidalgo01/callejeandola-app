const swaggerJsdoc = require("swagger-jsdoc");

const options = {
 definition: {
  openapi: "3.0.0",
  info: {
   title: "Callejeandola API",
   version: "1.0.0",
   description: "API for skate spots, events and sponsors"
  },
  servers: [
   {
    url: "http://localhost:4000"
   }
  ]
 },
 apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);