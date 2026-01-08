import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import type { TUserLoginResult, TUserData } from "../schemas/schema.js";
import bcrypt from "bcrypt";

@injectable()
export class UserService {
  findAllUsers = async (companyId: string) => {
    const response = await prisma.user.findMany({ where: { companyId } });

    return response;
  };

  loginUser = async (userLoginResult: TUserLoginResult) => {
    return userLoginResult;
  };

  userRegister = async (userData: TUserData, encodedToken: any) => {
    try {
      const hashedPassword = userData.password;

      const newUser = prisma.user.create({
        data: {
          name: userData.name,
          password: await bcrypt.hash(hashedPassword, 10),
          email: userData.email,
          role: userData.role,
          companyId: encodedToken.companyId,
        },
      });

      return newUser;
    } catch (error) {
      console.error(error);
      return { error: "Erro ao criar novo user" };
    }
  };
}
