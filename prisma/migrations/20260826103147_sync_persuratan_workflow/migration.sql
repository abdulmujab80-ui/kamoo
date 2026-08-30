/*
  Warnings:

  - You are about to drop the column `bulan` on the `NomorSurat` table. All the data in the column will be lost.
  - You are about to drop the column `nomor` on the `NomorSurat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tahun]` on the table `NomorSurat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "NomorSurat_tahun_bulan_key";

-- AlterTable
ALTER TABLE "NomorSurat" DROP COLUMN "bulan",
DROP COLUMN "nomor",
ADD COLUMN     "nomorUrut" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PengajuanSurat" ADD COLUMN     "kodeJenis" TEXT,
ADD COLUMN     "kodeNomor" TEXT;

-- AlterTable
ALTER TABLE "SuratKeluar" ADD COLUMN     "kodeJenis" TEXT,
ADD COLUMN     "kodeNomor" TEXT;

-- CreateIndex
CREATE INDEX "Approval_modul_dataId_idx" ON "Approval"("modul", "dataId");

-- CreateIndex
CREATE INDEX "Approval_userId_idx" ON "Approval"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Dokumen_kategori_idx" ON "Dokumen"("kategori");

-- CreateIndex
CREATE INDEX "Jadwal_mulai_idx" ON "Jadwal"("mulai");

-- CreateIndex
CREATE INDEX "Keuangan_jenis_idx" ON "Keuangan"("jenis");

-- CreateIndex
CREATE INDEX "Keuangan_tanggal_idx" ON "Keuangan"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "NomorSurat_tahun_key" ON "NomorSurat"("tahun");

-- CreateIndex
CREATE INDEX "PengajuanSurat_userId_idx" ON "PengajuanSurat"("userId");

-- CreateIndex
CREATE INDEX "PengajuanSurat_status_idx" ON "PengajuanSurat"("status");

-- CreateIndex
CREATE INDEX "Reimburse_userId_idx" ON "Reimburse"("userId");

-- CreateIndex
CREATE INDEX "Reimburse_status_idx" ON "Reimburse"("status");

-- CreateIndex
CREATE INDEX "SuratKeluar_status_idx" ON "SuratKeluar"("status");
