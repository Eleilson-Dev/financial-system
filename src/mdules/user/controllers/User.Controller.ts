import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { UserService } from "../services/User.Service.js";

@injectable()
export class UserController {
  constructor(@inject("UserService") private userService: UserService) {}

  listAllUsers = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response = await this.userService.listAllUsers(companyId);

    return res.status(200).json(response);
  };

  loginUser = async (req: Request, res: Response) => {
    const response = await this.userService.loginUser(
      res.locals.userLoginResult
    );

    return res.status(200).json(response);
  };

  userRegister = async (req: Request, res: Response) => {
    const response = await this.userService.userRegister(
      req.body,
      res.locals.encodedToken
    );

    return res
      .status(200)
      .json([{ message: "User registration successful.", response }]);
  };
}
