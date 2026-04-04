/*
  Warnings:

  - You are about to alter the column `stock` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - Made the column `barcode` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StockType" AS ENUM ('UNIT', 'KILO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stockType" "StockType" NOT NULL DEFAULT 'UNIT',
ALTER COLUMN "barcode" SET NOT NULL,
ALTER COLUMN "stock" DROP NOT NULL,
ALTER COLUMN "stock" DROP DEFAULT,
ALTER COLUMN "stock" SET DATA TYPE DECIMAL(10,2);
