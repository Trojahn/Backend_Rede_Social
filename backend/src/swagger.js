const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rede Social",
      version: "1.0.0",
      description: "Documentação da API (Rede Social)",
    },
  },
  apis: ["./src/routes/*.js"], // Caminho onde estão os arquivos de rotas a serem processados
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
