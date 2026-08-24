/*
  Warnings:

  - A unique constraint covering the columns `[nomorSurat]` on the table `SuratKeluar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pengajuanId]` on the table `SuratKeluar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isiSurat` to the `SuratKeluar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PengajuanSurat" ADD COLUMN     "isiSurat" TEXT;

-- AlterTable
ALTER TABLE "SuratKeluar" ADD COLUMN     "isiSurat" TEXT NOT NULL,
ADD COLUMN     "pengajuanId" TEXT;

-- CreateTable
CREATE TABLE "NomorSurat" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "nomor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NomorSurat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NomorSurat_tahun_bulan_key" ON "NomorSurat"("tahun", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "SuratKeluar_nomorSurat_key" ON "SuratKeluar"("nomorSurat");

-- CreateIndex
CREATE UNIQUE INDEX "SuratKeluar_pengajuanId_key" ON "SuratKeluar"("pengajuanId");

-- AddForeignKey
ALTER TABLE "SuratKeluar" ADD CONSTRAINT "SuratKeluar_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanSurat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
