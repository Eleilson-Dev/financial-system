import { OpenAPIV3 } from "openapi-types";

export const companySchemas: Record<string, OpenAPIV3.SchemaObject> = {
  CreateCompany: {
    type: "object",

    properties: {
      company: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Company-1",
          },
          document: {
            type: "string",
            example: "00.000.000/0000-00",
          },
        },

        required: ["name", "document"],
      },
      owner: {
        type: "object",

        properties: {
          name: {
            type: "string",
            example: "Jhon Doe",
          },
          email: {
            type: "string",
            example: "jhon@email.com",
          },
          password: {
            type: "string",
            example: "12345678",
          },
        },

        required: ["name", "email", "password"],
      },
    },

    required: ["company", "owner"],
  },

  CompanyResponse: {
    type: "object",

    properties: {
      company: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "uuid-1",
          },
          name: {
            type: "string",
            example: "company-1",
          },
          document: {
            type: "string",
            example: "00.000.000/0000-00",
          },
          createdAt: {
            type: "string",
            example: "2026-01-01T00:00:00.000Z",
          },
        },
      },

      cashAccount: {
        type: "object",

        properties: {
          id: {
            type: "string",
            example: "uuid-1",
          },
          balance: {
            type: "string",
            example: "1000",
          },
          companyId: {
            type: "string",
            example: "uuid-1",
          },
          updatedAt: {
            type: "string",
            example: "2026-01-01T00:00:00.000Z",
          },
        },
      },

      owner: {
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
            example: "jhon@gmail.com",
          },
          role: {
            type: "string",
            example: "OWNER",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
          companyId: {
            type: "string",
            example: "uuid",
          },
          createdAt: {
            type: "string",
            example: "2026-01-01T00:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            example: "2026-01-01T00:00:00.000Z",
          },
        },
      },
    },
  },
};
