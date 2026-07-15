/*
  Warnings:

  - You are about to drop the column `businessId` on the `Sequence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[facilityId,type]` on the table `Sequence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `facilityId` to the `Sequence` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Sequence_businessId_idx";

-- DropIndex
DROP INDEX "Sequence_businessId_type_key";

-- AlterTable
ALTER TABLE "Sequence" DROP COLUMN "businessId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Sequence_facilityId_idx" ON "Sequence"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_facilityId_type_key" ON "Sequence"("facilityId", "type");
