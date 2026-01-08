import { Router } from "express";
import { UserController } from "../controllers/User.Controller.js";
import { UserService } from "../services/User.Service.js";
import { container } from "tsyringe";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { userLoginSchema } from "../schemas/schema.js";
import { VerifyLoginUser } from "../../../shared/middlewares/VerifyLoginUser.middleware.js";

container.registerSingleton("UserService", UserService);
const userController = container.resolve(UserController);

export const userRouter = Router();

userRouter.get("/users/list", (req, res) =>
  userController.findAllUsers(req, res)
);

userRouter.post(
  "/user/login",
  ValidateBody.execute(userLoginSchema),
  VerifyLoginUser.execute,
  (req, res) => userController.loginUser(req, res)
);
