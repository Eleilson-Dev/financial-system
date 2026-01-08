import "express-async-errors";
import "reflect-metadata";

import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";

import { companyRouter } from "./mdules/company/routes/routes.js";
import { HandleErrors } from "./shared/errors/HandleErrors.js";
import { userRouter } from "./mdules/user/routes/routes.js";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(json());

app.use("/financial/sistem", companyRouter);
app.use("/financial/sistem", userRouter);

app.use(HandleErrors.execute);
