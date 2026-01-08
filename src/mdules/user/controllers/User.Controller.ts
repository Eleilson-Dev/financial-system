import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { UserService } from "../services/User.Service.js";

@injectable()
export class UserController {
  constructor(@inject("UserService") private userService: UserService) {}

  findAllUsers = async (req: Request, res: Response) => {
    const response = await this.userService.findAllUsers();

    return res.status(200).json(response);
  };

  loginUser = async (req: Request, res: Response) => {
    const response = await this.userService.loginUser(
      res.locals.userLoginResult
    );

    return res.status(200).json(response);
  };
}
