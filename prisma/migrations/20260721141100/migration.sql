-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "newQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "previousQuantity" INTEGER NOT NULL DEFAULT 0;
