-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "cvKeyVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "CvAccessLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CvAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "CvAccessLog_applicationId_createdAt_idx" ON "CvAccessLog"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "CvAccessLog_userId_createdAt_idx" ON "CvAccessLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CvAccessLog" ADD CONSTRAINT "CvAccessLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvAccessLog" ADD CONSTRAINT "CvAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
