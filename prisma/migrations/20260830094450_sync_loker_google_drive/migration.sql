/*
  Warnings:

  - A unique constraint covering the columns `[storageId]` on the table `LokerFile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `storageProvider` on table `LokerFile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storageId` on table `LokerFile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LokerFile" ALTER COLUMN "storageProvider" SET NOT NULL,
ALTER COLUMN "storageProvider" SET DEFAULT 'GOOGLE_DRIVE',
ALTER COLUMN "storageId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LokerFile_storageId_key" ON "LokerFile"("storageId");

-- CreateIndex
CREATE INDEX "LokerFile_updatedAt_idx" ON "LokerFile"("updatedAt");
