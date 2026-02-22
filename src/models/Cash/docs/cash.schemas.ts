import { OpenAPIV3 } from "openapi-types";

export const cashSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  OpenCashRequest: {
    type: "object",

    properties: {
      openingAmount: {
        type: "number",
        example: 150,
      },
    },
    required: ["openingAmount"],
  },

  OpenCashResponse: {
    type: "object",

    properties: {
      id: {
        type: "string",
        example: "uuid",
      },
      openedAt: {
        type: "string",
        example: "2026-01-01T00:00:00.000Z",
      },
      closedAt: {
        type: "string",
        nullable: true,
        example: null,
      },
      openingAmount: {
        type: "string",
        example: "150",
      },
      totalCash: {
        type: "string",
        example: "0",
      },
      totalPix: {
        type: "string",
        example: "0",
      },
      totalDebit: {
        type: "string",
        example: "0",
      },
      totalCredit: {
        type: "string",
        example: "0",
      },
      totalInflow: {
        type: "string",
        example: "0",
      },
      closingAmount: {
        type: "string",
        nullable: true,
        example: null,
      },
      status: {
        type: "string",
        example: "OPEN",
      },
      companyId: {
        type: "string",
        example: "uuid",
      },
      openedById: {
        type: "string",
        example: "uuid",
      },
      closedById: {
        type: "string",
        nullable: true,
        example: null,
      },
      countedCashAmount: {
        type: "string",
        example: "0",
      },
      expectedCashAmount: {
        type: "string",
        example: "150",
      },
      cashDifference: {
        type: "string",
        example: "0",
      },
      entries: {
        type: "array",
        items: {
          type: "string",
        },
        example: [],
      },
    },
  },

  CloseCashResponse: {
    type: "object",

    properties: {
      id: {
        type: "string",
        example: "uuid",
      },
      openedAt: {
        type: "string",
        example: "2026-01-01T00:00:00.000Z",
      },
      closedAt: {
        type: "string",
        nullable: true,
        example: "2026-01-01T00:00:00.000Z",
      },
      openingAmount: {
        type: "string",
        example: "150",
      },
      totalCash: {
        type: "string",
        example: "0",
      },
      totalPix: {
        type: "string",
        example: "0",
      },
      totalDebit: {
        type: "string",
        example: "0",
      },
      totalCredit: {
        type: "string",
        example: "0",
      },
      totalInflow: {
        type: "string",
        example: "0",
      },
      closingAmount: {
        type: "string",
        nullable: true,
        example: "150",
      },
      status: {
        type: "string",
        example: "CLOSED",
      },
      companyId: {
        type: "string",
        example: "uuid",
      },
      openedById: {
        type: "string",
        example: "uuid",
      },
      closedById: {
        type: "string",
        nullable: true,
        example: "uuid",
      },
      countedCashAmount: {
        type: "string",
        example: "150",
      },
      expectedCashAmount: {
        type: "string",
        example: "150",
      },
      cashDifference: {
        type: "string",
        example: "0",
      },
      entries: {
        type: "array",
        items: {
          type: "string",
        },
        example: [],
      },
    },
  },

  CloseCashRequest: {
    type: "object",

    properties: {
      countedCashAmount: {
        type: "string",
        example: "150",
      },
    },
    required: ["countedCashAmount"],
  },
};
