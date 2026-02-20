import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./index.js";

export const swaggerSetup = (app: any) => {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
      },
    }),
  );
};
