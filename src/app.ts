import "express-async-errors";
import "reflect-metadata";

import { swaggerSetup } from "./config/swagger/setup.js";

import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";

import { companyRouter } from "./models/company/routes/routes.js";
import { HandleErrors } from "./shared/errors/HandleErrors.js";
import { userRouter } from "./models/user/routes/routes.js";
import { cashRouter } from "./models/cash/routes/routes.js";
import { saleRouter } from "./models/sale/routes/routes.js";
import { employeeRouter } from "./models/employee/routes/routes.js";
import { salaryPaymentRouter } from "./models/salaryPayment/routes/routes.js";
import { SalaryPaymentHistoryRouter } from "./models/salaryPaymentHistory/routes/routes.js";
import { cashAccountRouter } from "./models/cashAccount/routes/routes.js";
import { expenseRouter } from "./models/expense/routes/routes.js";
import { monthlyClosureRouter } from "./models/monthlyClosure/routes/routes.js";
import { customerRouter } from "./models/customer/routes/routes.js";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(json());

swaggerSetup(app);

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
app.use("/financial/system", customerRouter);

app.use(HandleErrors.execute);
