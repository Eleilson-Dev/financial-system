import { OpenAPIV3 } from "openapi-types";

import { swaggerBase } from "./base.js";
import { userDocs } from "../../models/user/docs/user.docs.js";
import { companyDocs } from "../../models/company/docs/company.docs.js";
import { cashDocs } from "../../models/Cash/docs/cash.docs.js";
import { cashAcountDocs } from "../../models/CashAccount/docs/cashAcount.docs.js";
import { responses } from "./responses.js";

export const swaggerDocument: OpenAPIV3.Document = {
  ...swaggerBase,

  tags: [
    ...swaggerBase.tags!,
    ...companyDocs.tags,
    ...cashDocs.tags,
    ...cashAcountDocs.tags,
    ...userDocs.tags,
  ],

  paths: {
    ...swaggerBase.paths,
    ...companyDocs.paths,
    ...cashDocs.paths,
    ...cashAcountDocs.paths,
    ...userDocs.paths,
  },

  components: {
    ...swaggerBase.components,

    schemas: {
      ...swaggerBase.components?.schemas,
      ...companyDocs.schemas,
      ...cashDocs.schemas,
      ...cashAcountDocs.schemas,
      ...userDocs.schemas,
    },

    responses: {
      ...(swaggerBase.components?.responses ?? {}),
      ...responses,
    },
  },
};
