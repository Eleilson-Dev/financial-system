import "express-async-errors";
import "reflect-metadata";

import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";

import { companyRouter } from "./mdules/company/routes/routes.js";
import { HandleErrors } from "./shared/errors/HandleErrors.js";
import { userRouter } from "./mdules/user/routes/routes.js";
import { cashRouter } from "./mdules/Cash/routes/routes.js";
import { saleRouter } from "./mdules/sale/routes/routes.js";
import { employeeRouter } from "./mdules/employee/routes/routes.js";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(json());

app.use("/financial/sistem", companyRouter);
app.use("/financial/sistem", userRouter);
app.use("/financial/sistem", cashRouter);
app.use("/financial/sistem", saleRouter);
app.use("/financial/sistem", employeeRouter);

app.use(HandleErrors.execute);
