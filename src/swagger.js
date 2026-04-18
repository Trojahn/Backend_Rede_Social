const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend Rede Social",
      version: "1.0.0",
      description: "Documentação Backend Rede Social",
    },
  },
  apis: [path.join(__dirname, "./docs/*.yaml"), path.join(__dirname, "./docs/*.yml")],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
