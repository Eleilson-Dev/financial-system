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
import { salaryPaymentRouter } from "./mdules/salaryPayment/routes/routes.js";
import { SalaryPaymentHistoryRouter } from "./mdules/SalaryPaymentHistory/routes/routes.js";
import { cashAccountRouter } from "./mdules/CashAccount/routes/routes.js";
import { expenseRouter } from "./mdules/expense/routes/routes.js";
import { monthlyClosureRouter } from "./mdules/monthlyClosure/routes/routes.js";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(json());

app.use("/financial/system", companyRouter);
app.use("/financial/system", userRouter);
app.use("/financial/system", cashRouter);
app.use("/financial/system", saleRouter);
app.use("/financial/system", employeeRouter);
app.use("/financial/system", salaryPaymentRouter);
app.use("/financial/system", SalaryPaymentHistoryRouter);
app.use("/financial/system", cashAccountRouter);
app.use("/financial/system", expenseRouter);
app.use("/financial/system", monthlyClosureRouter);

app.use(HandleErrors.execute);
