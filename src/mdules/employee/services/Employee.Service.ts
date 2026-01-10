import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import type { TCreateEmployeeSchema } from "../schema/schema.js";

@injectable()
export class EmployeeService {
  createEmployee = async (
    employeeData: TCreateEmployeeSchema,
    companyId: any
  ) => {
    try {
      const newEmployee = prisma.employee.create({
        data: {
          companyId,
          name: employeeData.name,
          cpf: employeeData.cpf,
          salary: employeeData.salary,
        },
      });

      return newEmployee;
    } catch (error) {
      console.log(error);
      return "erro ao tentar registrar funcionario";
    }
  };
}
