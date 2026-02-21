import { OpenAPIV3 } from "openapi-types";

export const userPaths: OpenAPIV3.PathsObject = {
  "/users/list": {
    get: {
      tags: ["Users"],
      summary: "Lista todos os usuários",
      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: "List all users",
          content: {
            "application/json": {
              example: [
                {
                  id: "uuid-1",
                  name: "Max",
                  email: "max@email.com",
                  role: "OWNER",
                  isActive: true,
                  companyId: "uuid-company-1",
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
                {
                  id: "uuid-2",
                  name: "João",
                  email: "joao@email.com",
                  role: "ADMIN",
                  isActive: true,
                  companyId: "uuid-company-1",
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
            },
          },
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
        },

        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    },
  },

  "/user/login": {
    post: {
      tags: ["Users"],
      summary: "User Login",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoginRequest",
            },
          },
        },
      },

      responses: {
        200: {
          description: "Success logged-in user",

          content: {
            "application/json": {
              schema: {
                type: "object",

                properties: {
                  token: {
                    type: "string",
                  },

                  user: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
        },

        400: {
          $ref: "#/components/responses/BadRequest",
        },

        401: {
          $ref: "#/components/responses/Unauthorized",
        },

        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    },
  },

  "/user/register": {
    post: {
      tags: ["Users"],
      summary: "User Registration",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          "application/json": {
            schema: {
              $ref: "#components/schemas/RegisterRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "User successfully registered.",

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisteredUser",
              },
            },
          },
        },
        400: {
          $ref: "#/components/responses/BadRequest",
        },

        401: {
          $ref: "#/components/responses/Unauthorized",
        },

        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    },
  },
};
