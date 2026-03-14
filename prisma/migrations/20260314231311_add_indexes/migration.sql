-- CreateIndex
CREATE INDEX "CashAccountTransaction_cashAccountId_createdAt_idx" ON "CashAccountTransaction"("cashAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "CashAccountTransaction_referenceMonth_referenceYear_idx" ON "CashAccountTransaction"("referenceMonth", "referenceYear");

-- CreateIndex
CREATE INDEX "CashRegisterEntry_cashRegisterId_createdAt_idx" ON "CashRegisterEntry"("cashRegisterId", "createdAt");

-- CreateIndex
CREATE INDEX "CashRegisterEntry_referenceMonth_referenceYear_idx" ON "CashRegisterEntry"("referenceMonth", "referenceYear");

-- CreateIndex
CREATE INDEX "Sale_companyId_createdAt_idx" ON "Sale"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_referenceMonth_referenceYear_companyId_idx" ON "Sale"("referenceMonth", "referenceYear", "companyId");
