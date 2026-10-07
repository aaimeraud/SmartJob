-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM (
  'full_time',
  'part_time',
  'contract',
  'internship',
  'apprenticeship',
  'freelance'
);

-- CreateTable
CREATE TABLE "JobOffer" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "contractType" "ContractType" NOT NULL,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "skills" TEXT[],
  "status" "JobOfferStatus" NOT NULL DEFAULT 'draft',
  "publishedAt" TIMESTAMP(3),
  "recruiterId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobOffer_recruiterId_idx" ON "JobOffer"("recruiterId");

-- CreateIndex
CREATE INDEX "JobOffer_status_createdAt_idx" ON "JobOffer"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "JobOffer"
ADD CONSTRAINT "JobOffer_recruiterId_fkey"
FOREIGN KEY ("recruiterId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
