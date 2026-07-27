-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fileKey" TEXT,
ADD COLUMN     "imageUrl" TEXT DEFAULT '/img/system-user.png';
