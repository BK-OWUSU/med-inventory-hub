-- CreateEnum
CREATE TYPE "MovementReason" AS ENUM ('DAMAGED', 'EXPIRED', 'THEFT', 'AUDIT_RECONCILIATION', 'DISPENSED');

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "reason" "MovementReason";
