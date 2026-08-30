-- CreateEnum
CREATE TYPE "LokerPermission" AS ENUM ('VIEWER', 'EDITOR');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('GOOGLE_DRIVE');

-- CreateTable
CREATE TABLE "Loker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LokerFolder" (
    "id" TEXT NOT NULL,
    "lokerId" TEXT NOT NULL,
    "parentId" TEXT,
    "nama" TEXT NOT NULL,
    "storageProvider" "StorageProvider",
    "storageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LokerFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LokerFile" (
    "id" TEXT NOT NULL,
    "lokerId" TEXT NOT NULL,
    "folderId" TEXT,
    "nama" TEXT NOT NULL,
    "storageProvider" "StorageProvider",
    "storageId" TEXT,
    "storageUrl" TEXT,
    "ukuran" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LokerFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LokerShare" (
    "id" TEXT NOT NULL,
    "lokerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "LokerPermission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LokerShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Loker_userId_key" ON "Loker"("userId");

-- CreateIndex
CREATE INDEX "Loker_userId_idx" ON "Loker"("userId");

-- CreateIndex
CREATE INDEX "LokerFolder_lokerId_idx" ON "LokerFolder"("lokerId");

-- CreateIndex
CREATE INDEX "LokerFolder_parentId_idx" ON "LokerFolder"("parentId");

-- CreateIndex
CREATE INDEX "LokerFile_lokerId_idx" ON "LokerFile"("lokerId");

-- CreateIndex
CREATE INDEX "LokerFile_folderId_idx" ON "LokerFile"("folderId");

-- CreateIndex
CREATE INDEX "LokerFile_createdAt_idx" ON "LokerFile"("createdAt");

-- CreateIndex
CREATE INDEX "LokerShare_userId_idx" ON "LokerShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LokerShare_lokerId_userId_key" ON "LokerShare"("lokerId", "userId");

-- AddForeignKey
ALTER TABLE "Loker" ADD CONSTRAINT "Loker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LokerFolder" ADD CONSTRAINT "LokerFolder_lokerId_fkey" FOREIGN KEY ("lokerId") REFERENCES "Loker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LokerFolder" ADD CONSTRAINT "LokerFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LokerFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LokerFile" ADD CONSTRAINT "LokerFile_lokerId_fkey" FOREIGN KEY ("lokerId") REFERENCES "Loker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LokerFile" ADD CONSTRAINT "LokerFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "LokerFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LokerShare" ADD CONSTRAINT "LokerShare_lokerId_fkey" FOREIGN KEY ("lokerId") REFERENCES "Loker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LokerShare" ADD CONSTRAINT "LokerShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
