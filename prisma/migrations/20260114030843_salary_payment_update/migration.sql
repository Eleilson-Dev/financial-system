/*
  Warnings:

  - Added the required column `referenceYear` to the `SalaryPayment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `referenceMonth` on the `SalaryPayment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SalaryPayment" ADD COLUMN     "referenceYear" INTEGER NOT NULL,
DROP COLUMN "referenceMonth",
ADD COLUMN     "referenceMonth" INTEGER NOT NULL;
