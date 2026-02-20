import { OpenAPIV3 } from "openapi-types";

export const userSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  User: {
    type: "object",

    properties: {
      id: {
        type: "string",
        example: "uuid",
      },

      name: {
        type: "string",
        example: "Max",
      },

      email: {
        type: "string",
        example: "max@email.com",
      },
    },
  },

  LoginRequest: {
    type: "object",

    required: ["email", "password"],

    properties: {
      email: {
        type: "string",
        example: "user@gmail.com",
      },

      password: {
        type: "string",
        example: "123456",
      },
    },
  },

  ErrorResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
      },
      status: {
        type: "number",
      },
    },
  },
};
