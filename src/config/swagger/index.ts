import { OpenAPIV3 } from "openapi-types";

import { swaggerBase } from "./base.js";
import { userDocs } from "../../models/user/docs/user.docs.js";
import { companyDocs } from "../../models/company/docs/company.docs.js";
import { cashDocs } from "../../models/Cash/docs/cash.docs.js";
import { responses } from "./responses.js";

export const swaggerDocument: OpenAPIV3.Document = {
  ...swaggerBase,

  tags: [
    ...swaggerBase.tags!,
    ...cashDocs.tags,
    ...companyDocs.tags,
    ...userDocs.tags,
  ],

  paths: {
    ...swaggerBase.paths,
    ...cashDocs.paths,
    ...companyDocs.paths,
    ...userDocs.paths,
  },

  components: {
    ...swaggerBase.components,

    schemas: {
      ...swaggerBase.components?.schemas,
      ...cashDocs.schemas,
      ...userDocs.schemas,
      ...companyDocs.schemas,
    },

    responses: {
      ...(swaggerBase.components?.responses ?? {}),
      ...responses,
    },
  },
};
