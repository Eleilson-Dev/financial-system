import { OpenAPIV3 } from "openapi-types";

export const companyPaths: OpenAPIV3.PathsObject = {
  "/companies/list": {
    get: {
      tags: ["Company"],
      summary: "List all companies.",

      responses: {
        200: {
          description: "List of companies",

          content: {
            "application/json": {
              schema: {
                type: "array",

                items: {
                  $ref: "#/components/schemas/CompanyResponse",
                },

                example: [
                  {
                    id: "uuid-1",
                    name: "company-1",
                    document: "00.000.000/0000-00",
                    createdAt: "2026-01-01T00:00:00.000Z",

                    cashAccount: {
                      id: "uuid-cash-1",
                      balance: "1000",
                      companyId: "uuid-1",
                      updatedAt: "2026-01-01T00:00:00.000Z",
                    },
                  },

                  {
                    id: "uuid-2",
                    name: "company-2",
                    document: "11.111.111/0000-11",
                    createdAt: "2026-01-02T00:00:00.000Z",

                    cashAccount: {
                      id: "uuid-cash-2",
                      balance: "2500",
                      companyId: "uuid-2",
                      updatedAt: "2026-01-02T00:00:00.000Z",
                    },
                  },
                ],
              },
            },
          },
        },
        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    },
  },
  "/company/register": {
    post: {
      tags: ["Company"],
      summary: "Create a company record.",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateCompany",
            },
          },
        },
      },

      responses: {
        200: {
          description: "New company created",

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CompanyResponse",
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
