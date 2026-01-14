/*
  Warnings:

  - Added the required column `referenceMonth` to the `CashAccountTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceYear` to the `CashAccountTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceMonth` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceYear` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceMonth` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceYear` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CashAccountTransaction" ADD COLUMN     "referenceMonth" INTEGER NOT NULL,
ADD COLUMN     "referenceYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "referenceMonth" INTEGER NOT NULL,
ADD COLUMN     "referenceYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "referenceMonth" INTEGER NOT NULL,
ADD COLUMN     "referenceYear" INTEGER NOT NULL;
