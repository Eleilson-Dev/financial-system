/*
  Warnings:

  - The `status` column on the `CashRegister` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `paymentMethod` to the `CashAccountTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `CustomerAccountTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CashRegisterStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "CashAccountTransaction" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "CashRegister" ADD COLUMN     "totalCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalCredit" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalDebit" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalPix" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "openingAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "closingAmount" SET DATA TYPE DECIMAL(12,2),
DROP COLUMN "status",
ADD COLUMN     "status" "CashRegisterStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "CustomerAccountTransaction" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL;
