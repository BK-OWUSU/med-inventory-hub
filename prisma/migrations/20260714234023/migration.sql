/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `drugcategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `drugcategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "drugcategory" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "drugcategory_key_key" ON "drugcategory"("key");
