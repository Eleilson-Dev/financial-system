/*
  Warnings:

  - A unique constraint covering the columns `[month,year,companyId]` on the table `MonthlyClosure` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodEnd` to the `MonthlyClosure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStart` to the `MonthlyClosure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MonthlyClosure" ADD COLUMN     "isEarlyClosure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "periodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "periodStart" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyClosure_month_year_companyId_key" ON "MonthlyClosure"("month", "year", "companyId");
