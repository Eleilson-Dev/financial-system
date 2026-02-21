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
        example: "jhon doe",
      },

      email: {
        type: "string",
        example: "jhon@email.com",
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

  RegisterRequest: {
    type: "object",

    required: ["name", "email", "password", "role"],

    properties: {
      name: {
        type: "string",
        example: "Jhon doe",
      },
      email: {
        type: "string",
        example: "user@gmail.com",
      },
      password: {
        type: "string",
        example: "123456",
      },
      role: {
        type: "string",
        example: "ADMIN/OPERATOR",
      },
    },
  },

  RegisteredUser: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "uuid",
      },

      name: {
        type: "string",
        example: "Jhon doe",
      },

      email: {
        type: "string",
        example: "jhon@email.com",
      },
      role: {
        type: "string",
        example: "ADMIN/OPERATOR",
      },
      companyId: {
        type: "string",
        example: "uuid",
      },
      isActive: {
        type: "boolean",
        example: true,
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
