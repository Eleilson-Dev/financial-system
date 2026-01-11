/*
  Warnings:

  - A unique constraint covering the columns `[companyId]` on the table `CashAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CashAccount_companyId_key" ON "CashAccount"("companyId");
