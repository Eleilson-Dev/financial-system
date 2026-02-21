import { OpenAPIV3 } from "openapi-types";

export const cashPaths: OpenAPIV3.PathsObject = {
  "/open/cash": {
    post: {
      tags: ["Cash"],
      summary: "Open cash",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/openCashRequest",
            },
          },
        },
      },

      responses: {
        200: {
          description: "O caixa foi aberto",

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/openCashResponse",
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
  "/show/open/cash": {
    get: {
      tags: ["Cash"],
      summary: "Shows the open cash register using the ID.",
      security: [{ bearerAuth: [] }],

      responses: {},
    },
  },
  "/show/close/cash": {
    get: {
      tags: ["Cash"],
      summary: "Show closed cash",
      security: [{ bearerAuth: [] }],

      responses: {},
    },
  },
  "/close/cash": {
    post: {
      tags: ["Cash"],
      summary: "Close cash",
      security: [{ bearerAuth: [] }],

      responses: {},
    },
  },
};
