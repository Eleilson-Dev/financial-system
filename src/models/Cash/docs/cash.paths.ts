import { OpenAPIV3 } from "openapi-types";

export const cashPaths: OpenAPIV3.PathsObject = {
  "/open/cash": {
    post: {
      tags: ["Cash"],
      summary: "Open cash.",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/OpenCashRequest",
            },
          },
        },
      },

      responses: {
        200: {
          description: "The cashier was opened.",

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OpenCashResponse",
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
      summary:
        "Displays the open cash register of the logged-in user using the ID.",
      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: "Open cash found.",

          content: {
            "application/json": {
              schema: {
                $ref: "#components/schemas/OpenCashResponse",
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
  "/show/close/cash": {
    get: {
      tags: ["Cash"],
      summary: "Show closed cash",
      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: "Close cash found.",

          content: {
            "application/json": {
              schema: {
                $ref: "#components/schemas/CloseCashResponse",
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
  "/close/cash": {
    post: {
      tags: ["Cash"],
      summary: "Close cash",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CloseCashRequest",
            },
          },
        },
      },

      responses: {
        200: {
          description: "Close cash.",

          content: {
            "application/json": {
              schema: {
                $ref: "#components/schemas/CloseCashResponse",
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
