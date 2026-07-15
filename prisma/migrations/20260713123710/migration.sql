-- CreateEnum
CREATE TYPE "SessionReason" AS ENUM ('LOGIN', 'LOGOUT', 'SESSION_EXPIRED', 'FORCED_LOGOUT', 'PASSWORD_CHANGED', 'ACCOUNT_DISABLED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "needsPasswordChange" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "user_session_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "sessionToken" TEXT,
    "reason" "SessionReason" NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_session_logs_sessionToken_key" ON "user_session_logs"("sessionToken");

-- CreateIndex
CREATE INDEX "user_session_logs_userId_idx" ON "user_session_logs"("userId");

-- CreateIndex
CREATE INDEX "user_session_logs_facilityId_idx" ON "user_session_logs"("facilityId");

-- CreateIndex
CREATE INDEX "user_session_logs_loginAt_idx" ON "user_session_logs"("loginAt");

-- CreateIndex
CREATE INDEX "user_session_logs_logoutAt_idx" ON "user_session_logs"("logoutAt");

-- CreateIndex
CREATE INDEX "user_session_logs_isActive_idx" ON "user_session_logs"("isActive");

-- AddForeignKey
ALTER TABLE "user_session_logs" ADD CONSTRAINT "user_session_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session_logs" ADD CONSTRAINT "user_session_logs_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
