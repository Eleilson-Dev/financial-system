import { OpenAPIV3 } from "openapi-types";

import { swaggerBase } from "./base.js";
import { userDocs } from "../../models/user/docs/user.docs.js";
import { companyDocs } from "../../models/company/docs/company.docs.js";
import { responses } from "./responses.js";

export const swaggerDocument: OpenAPIV3.Document = {
  ...swaggerBase,

  tags: [...swaggerBase.tags!, ...companyDocs.tags, ...userDocs.tags],

  paths: {
    ...swaggerBase.paths,
    ...userDocs.paths,
  },

  components: {
    ...swaggerBase.components,

    schemas: {
      ...swaggerBase.components?.schemas,
      ...userDocs.schemas,
    },

    responses: {
      ...(swaggerBase.components?.responses ?? {}),
      ...responses,
    },
  },
};
