-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('BOX', 'BOTTLE', 'VIAL', 'TUBE', 'AMPOULE', 'PACK', 'PIECE');

-- CreateEnum
CREATE TYPE "DosageForm" AS ENUM ('TABLET', 'CAPSULE', 'SYRUP', 'VIAL', 'INJECTION', 'CREAM', 'DROPS', 'SUSPENSION', 'OINTMENT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PHARMACIST', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('HOSPITAL', 'PHARMACY', 'CLINIC');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'APPROVED', 'PARTIALLY_FULFILLED', 'SHIPPED', 'RECEIVED', 'DELIVERED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('REQUEST', 'SUPPLY');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'EXPIRY', 'RETURN', 'TRANSFER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'ORDER_CREATED', 'ORDER_APPROVED', 'ORDER_REJECTED', 'ORDER_DELIVERED', 'INVENTORY_UPDATED', 'INVENTORY_CREATED', 'USER_CREATED', 'FACILITY_CREATED');

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FacilityType" NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "licenseNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "phone" TEXT,
    "facilityId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drugs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "strength" TEXT,
    "unit" "Unit" NOT NULL,
    "dosageForm" "DosageForm",
    "description" TEXT,
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DrugCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "manufacturer" TEXT,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(65,30),
    "minStockLevel" INTEGER NOT NULL DEFAULT 20,
    "batchNumber" TEXT,
    "receivedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "supplierId" TEXT,
    "type" "OrderType" NOT NULL DEFAULT 'REQUEST',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "totalValue" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "strength" TEXT,
    "dosageForm" "DosageForm",
    "unit" "Unit" NOT NULL,
    "quantityRequested" INTEGER NOT NULL,
    "quantitySupplied" INTEGER,
    "unitPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "referenceNo" TEXT,
    "orderItemId" TEXT,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "facilityId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facilities_licenseNumber_key" ON "facilities"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_facilityId_idx" ON "users"("facilityId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "drugs_categoryId_idx" ON "drugs"("categoryId");

-- CreateIndex
CREATE INDEX "drugs_name_idx" ON "drugs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_name_strength_dosageForm_key" ON "drugs"("name", "strength", "dosageForm");

-- CreateIndex
CREATE UNIQUE INDEX "DrugCategory_name_key" ON "DrugCategory"("name");

-- CreateIndex
CREATE INDEX "inventories_facilityId_idx" ON "inventories"("facilityId");

-- CreateIndex
CREATE INDEX "inventories_drugId_idx" ON "inventories"("drugId");

-- CreateIndex
CREATE INDEX "inventories_expiryDate_idx" ON "inventories"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_facilityId_drugId_batchNumber_key" ON "inventories"("facilityId", "drugId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_requesterId_idx" ON "orders"("requesterId");

-- CreateIndex
CREATE INDEX "orders_supplierId_idx" ON "orders"("supplierId");

-- CreateIndex
CREATE INDEX "stock_movements_inventoryId_idx" ON "stock_movements"("inventoryId");

-- CreateIndex
CREATE INDEX "stock_movements_performedById_idx" ON "stock_movements"("performedById");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DrugCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
