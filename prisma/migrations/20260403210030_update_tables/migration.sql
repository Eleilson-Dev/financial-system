/*
  Warnings:

  - A unique constraint covering the columns `[barcode,companyId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_barcode_key";

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "categoryNameSnapshot" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_companyId_key" ON "Product"("barcode", "companyId");

-- CreateIndex
CREATE INDEX "SaleItem_categoryId_idx" ON "SaleItem"("categoryId");
