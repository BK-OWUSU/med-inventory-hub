-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'INVENTORY', 'EXPIRY', 'USER', 'FACILITY', 'SYSTEM');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';
