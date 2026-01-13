/*
  Warnings:

  - Added the required column `direction` to the `CashAccountTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "CashAccountTransaction" ADD COLUMN     "direction" "TransactionDirection" NOT NULL,
ADD COLUMN     "referenceId" TEXT;
