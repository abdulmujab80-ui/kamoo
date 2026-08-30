import type { Prisma } from "@prisma/client";

export type KodeJenisSurat = "SB" | "SK";

export const KODE_NOMOR_SURAT: Record<KodeJenisSurat, string> = {
  SB: "04",
  SK: "03",
};

export function tentukanKodeJenis(
  jenis: string,
  kodeJenis?: string | null
): KodeJenisSurat {
  // Prioritaskan kode yang sudah disimpan pada pengajuan
  if (kodeJenis === "SK") {
    return "SK";
  }

  if (kodeJenis === "SB") {
    return "SB";
  }

  // Fallback berdasarkan nama jenis surat
  const normalized = jenis.trim().toLowerCase();

  if (
    normalized === "sk" ||
    normalized.includes("surat keputusan") ||
    normalized.includes("keputusan")
  ) {
    return "SK";
  }

  // Semua jenis surat umum masuk SB
  return "SB";
}

export async function generateNomorSurat(
  tx: Prisma.TransactionClient,
  kodeJenis: KodeJenisSurat,
  tanggalSurat: Date = new Date()
) {
  const tahun = tanggalSurat.getFullYear();

  /*
   * Counter menggunakan 1 record per tahun.
   *
   * Jika tahun belum ada:
   * nomorUrut = 1
   *
   * Jika sudah ada:
   * nomorUrut + 1
   *
   * increment dilakukan langsung oleh PostgreSQL sehingga
   * lebih aman jika dua surat diterbitkan hampir bersamaan.
   */
  const counter = await tx.nomorSurat.upsert({
    where: {
      tahun,
    },

    create: {
      tahun,
      nomorUrut: 1,
    },

    update: {
      nomorUrut: {
        increment: 1,
      },
    },
  });

  const nomorUrut = String(counter.nomorUrut).padStart(2, "0");

  const kodeNomor = KODE_NOMOR_SURAT[kodeJenis];

  const tanggal = String(tanggalSurat.getDate()).padStart(2, "0");

  const bulan = String(tanggalSurat.getMonth() + 1).padStart(2, "0");

  const nomorSurat =
    `${nomorUrut}.${kodeJenis}.${kodeNomor}` +
    `/KATI/${tanggal}.${bulan}.${tahun}`;

  return {
    nomorSurat,
    nomorUrut: counter.nomorUrut,
    kodeJenis,
    kodeNomor,
    tahun,
  };
}