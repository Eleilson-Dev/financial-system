import { Router } from "express";
import { UserController } from "../controllers/User.Controller.js";
import { UserService } from "../services/User.Service.js";
import { container } from "tsyringe";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { userCreateSchema, userLoginSchema } from "../schemas/schema.js";
import { VerifyLoginUser } from "../../../shared/middlewares/VerifyLoginUser.middleware.js";
import { IsEmailExits } from "../../../shared/middlewares/IsEmailExists.middleware.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";

container.registerSingleton("UserService", UserService);
const userController = container.resolve(UserController);

export const userRouter = Router();

userRouter.get(
  "/users/list",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  (req, res) => userController.listAllUsers(req, res),
);

userRouter.post(
  "/user/login",
  ValidateBody.execute(userLoginSchema),
  VerifyLoginUser.execute,
  (req, res) => userController.loginUser(req, res),
);

userRouter.post(
  "/user/register",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(userCreateSchema),
  IsEmailExits.execute,
  (req, res) => userController.userRegister(req, res),
);
