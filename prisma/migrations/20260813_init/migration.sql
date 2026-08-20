-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COORDINATOR', 'DIRIGENTE', 'MEMBER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordinator" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "zone" TEXT NOT NULL,
    "notes" TEXT,
    "targetMembers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dirigente" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "zone" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dirigente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "zone" TEXT NOT NULL,
    "dirigenteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "coordinatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationProfile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "businessName" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "businessPhone" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "employeeCount" INTEGER,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "extraAddress" TEXT,
    "legalRepresentativeName" TEXT,
    "legalRepresentativeId" TEXT,
    "companyType" TEXT,
    "website" TEXT,
    "publicEmail" TEXT,
    "publicNotes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_code_key" ON "Coordinator"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_email_key" ON "Coordinator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dirigente_code_key" ON "Dirigente"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Dirigente_email_key" ON "Dirigente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_code_key" ON "Member"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- AddForeignKey
ALTER TABLE "Dirigente" ADD CONSTRAINT "Dirigente_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Coordinator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_dirigenteId_fkey" FOREIGN KEY ("dirigenteId") REFERENCES "Dirigente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Coordinator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
