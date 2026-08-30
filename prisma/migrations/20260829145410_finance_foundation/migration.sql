/*
  Warnings:

  - The `status` column on the `Reimburse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[reimburseId]` on the table `Keuangan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kategori` to the `Keuangan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Keuangan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reimburse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusReimburse" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK', 'DIBAYAR');

-- AlterTable
ALTER TABLE "Keuangan" ADD COLUMN     "kategori" TEXT NOT NULL,
ADD COLUMN     "pihak" TEXT,
ADD COLUMN     "reimburseId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Reimburse" ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusReimburse" NOT NULL DEFAULT 'MENUNGGU';

-- CreateIndex
CREATE UNIQUE INDEX "Keuangan_reimburseId_key" ON "Keuangan"("reimburseId");

-- CreateIndex
CREATE INDEX "Keuangan_kategori_idx" ON "Keuangan"("kategori");

-- CreateIndex
CREATE INDEX "Reimburse_status_idx" ON "Reimburse"("status");

-- CreateIndex
CREATE INDEX "Reimburse_createdAt_idx" ON "Reimburse"("createdAt");

-- AddForeignKey
ALTER TABLE "Keuangan" ADD CONSTRAINT "Keuangan_reimburseId_fkey" FOREIGN KEY ("reimburseId") REFERENCES "Reimburse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
