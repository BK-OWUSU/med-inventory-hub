/*
  Warnings:

  - You are about to drop the column `createdAt` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the `DrugCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[customId]` on the table `drugs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customId]` on the table `facilities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customId]` on the table `stock_movements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entityType` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customId` to the `drugs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customId` to the `facilities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customId` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('USER', 'FACILITY', 'DRUG', 'INVENTORY', 'ORDER', 'STOCK_MOVEMENT');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "drugs" DROP CONSTRAINT "drugs_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "AuditEntity" NOT NULL;

-- AlterTable
ALTER TABLE "drugs" ADD COLUMN     "customId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "customId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventories" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "facilityId" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "customId" TEXT NOT NULL,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "receivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "createdAt",
ADD COLUMN     "customId" TEXT NOT NULL,
ADD COLUMN     "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "customId" TEXT NOT NULL,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "DrugCategory";

-- CreateTable
CREATE TABLE "drugcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drugcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NotificationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NotificationToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "drugcategory_name_key" ON "drugcategory"("name");

-- CreateIndex
CREATE INDEX "drugcategory_name_idx" ON "drugcategory"("name");

-- CreateIndex
CREATE INDEX "_NotificationToUser_B_index" ON "_NotificationToUser"("B");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_customId_key" ON "drugs"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_customId_key" ON "facilities"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_customId_key" ON "orders"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_customId_key" ON "stock_movements"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "users_customId_key" ON "users"("customId");

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "drugcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToUser" ADD CONSTRAINT "_NotificationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToUser" ADD CONSTRAINT "_NotificationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
