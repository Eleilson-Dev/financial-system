import { OpenAPIV3 } from "openapi-types";

import { swaggerBase } from "./base.js";
import { userDocs } from "../../models/user/docs/user.userDocs.js";

export const swaggerDocument: OpenAPIV3.Document = {
  ...swaggerBase,

  tags: [...swaggerBase.tags!, ...userDocs.tags],

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
  },
};
