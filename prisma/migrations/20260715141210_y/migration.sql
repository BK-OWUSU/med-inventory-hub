/*
  Warnings:

  - You are about to drop the column `key` on the `drugcategory` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "drugcategory_key_key";

-- AlterTable
ALTER TABLE "drugcategory" DROP COLUMN "key";
