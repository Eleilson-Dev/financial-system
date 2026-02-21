import { OpenAPIV3 } from "openapi-types";

export const userPaths: OpenAPIV3.PathsObject = {
  "/users/list": {
    get: {
      tags: ["Users"],
      summary: "Lista todos os usuários",
      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: "Lista de usuários",
          content: {
            "aplication/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/User",
                },
              },

              example: [
                {
                  id: "uuid-1",
                  name: "Max",
                  email: "max@email.com",
                },
                {
                  id: "uuid-2",
                  name: "João",
                  email: "joao@email.com",
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
      summary: "Login do usuário",
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
          description: "Sucesso",

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
      summary: "Cadastro de Usuário",
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
          description: "Usuário Cadastrado com sucesso",

          content: {
            "application/json": {
              schema: {
                type: "object",

                properties: {
                  registeredUser: {
                    $ref: "#/components/schemas/RegisteredUser",
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
};
