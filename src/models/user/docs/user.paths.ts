import { OpenAPIV3 } from "openapi-types";

export const userPaths: OpenAPIV3.PathsObject = {
  "/user/login": {
    post: {
      tags: ["Users"],

      summary: "Login do usuário",

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
          description: "Erro de validação",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                message: "Email e Senha são obrigatórios",
                status: 400,
              },
            },
          },
        },

        401: {
          description: "Credenciais inválidas",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                message: "Email ou senha inválidos",
                status: 401,
              },
            },
          },
        },

        500: {
          description: "Erro interno do servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                message: "Erro interno do servidor",
                status: 500,
              },
            },
          },
        },
      },
    },
  },
};
