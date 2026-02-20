import { OpenAPIV3 } from "openapi-types";

export const swaggerBase: OpenAPIV3.Document = {
  openapi: "3.0.0",

  info: {
    title: "Financial System API",
    version: "1.0.0",
    description: "API para gerenciamento financeiro",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {},
  },

  tags: [],

  paths: {},
};
