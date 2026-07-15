/*
  Warnings:

  - Added the required column `updatedAt` to the `DrugCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DrugCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentNo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sequence_businessId_idx" ON "Sequence"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_businessId_type_key" ON "Sequence"("businessId", "type");
