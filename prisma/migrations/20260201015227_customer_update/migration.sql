/*
  Warnings:

  - You are about to alter the column `nameNormalized` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "nameNormalized" SET DATA TYPE VARCHAR(255);
