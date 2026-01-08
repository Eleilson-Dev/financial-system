import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import type { TUserLoginResult } from "../schemas/schema.js";

@injectable()
export class UserService {
  findAllUsers = async () => {
    const response = await prisma.user.findMany();

    return response;
  };

  loginUser = async (userLoginResult: TUserLoginResult) => {
    return userLoginResult;
  };
}
