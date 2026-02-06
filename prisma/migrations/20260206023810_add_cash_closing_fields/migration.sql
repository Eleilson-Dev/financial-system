-- AlterTable
ALTER TABLE "CashRegister" ADD COLUMN     "cashDifference" DECIMAL(12,2),
ADD COLUMN     "countedCashAmount" DECIMAL(12,2),
ADD COLUMN     "expectedCashAmount" DECIMAL(12,2);
