import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import type { TUserLoginResult, TUserData } from "../schemas/schema.js";
import bcrypt from "bcrypt";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UserService {
  listAllUsers = async (companyId: string) => {
    const response = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return response;
  };

  loginUser = async (userLoginResult: TUserLoginResult) => {
    return userLoginResult;
  };

  userRegister = async (userData: TUserData, encodedToken: any) => {
    try {
      const hashedPassword = userData.password;

      const newUser = await prisma.user.create({
        data: {
          name: userData.name,
          password: await bcrypt.hash(hashedPassword, 10),
          email: userData.email.toLowerCase(),
          role: userData.role,
          companyId: encodedToken.companyId,
        },
      });

      const { password, ...userWithoutPassword } = newUser;

      return userWithoutPassword;
    } catch (error) {
      console.error(error);
      throw new AppError(400, "Erro ao criar novo user");
    }
  };
}
