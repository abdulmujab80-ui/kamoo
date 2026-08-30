-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "dataId" TEXT,
ADD COLUMN     "modul" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_modul_dataId_idx" ON "AuditLog"("modul", "dataId");
