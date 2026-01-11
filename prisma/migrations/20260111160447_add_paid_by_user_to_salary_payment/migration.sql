/*
  Warnings:

  - Added the required column `paidByUserId` to the `SalaryPayment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SalaryStatus" AS ENUM ('PAID');

-- AlterTable
ALTER TABLE "SalaryPayment" ADD COLUMN     "paidByUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_paidByUserId_fkey" FOREIGN KEY ("paidByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
