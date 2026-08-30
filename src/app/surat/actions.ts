"use server";

import { prisma } from "@/lib/prisma";
import { requireSekretaris } from "@/lib/permissions";

import {
  generateNomorSurat,
  tentukanKodeJenis,
} from "@/lib/generateNomorSurat";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function terbitkanSurat(formData: FormData) {
  const actor = await requireSekretaris();

  const pengajuanId = String(
    formData.get("pengajuanId") ?? ""
  ).trim();

  if (!pengajuanId) {
    throw new Error("ID pengajuan tidak ditemukan.");
  }


  /*
   * Cek awal sebelum transaction.
   */
  const existingPengajuan =
    await prisma.pengajuanSurat.findUnique({
      where: {
        id: pengajuanId,
      },

      include: {
        suratKeluar: true,
      },
    });


  if (!existingPengajuan) {
    throw new Error("Pengajuan surat tidak ditemukan.");
  }


  /*
   * Kalau sudah pernah diterbitkan,
   * jangan membuat surat kedua.
   *
   * Langsung arahkan ke surat yang sudah ada.
   */
  if (existingPengajuan.suratKeluar) {
    redirect(
      `/surat/keluar/${existingPengajuan.suratKeluar.id}`
    );
  }


  /*
   * Hanya pengajuan yang sudah DISETUJUI
   * yang boleh diterbitkan.
   */
  if (existingPengajuan.status !== "DISETUJUI") {
    throw new Error(
      "Surat hanya dapat diterbitkan setelah pengajuan disetujui."
    );
  }


  const suratKeluar = await prisma.$transaction(
    async (tx) => {
      /*
       * Ambil ulang data di dalam transaction.
       */
      const pengajuan =
        await tx.pengajuanSurat.findUnique({
          where: {
            id: pengajuanId,
          },

          include: {
            suratKeluar: true,
          },
        });


      if (!pengajuan) {
        throw new Error(
          "Pengajuan surat tidak ditemukan."
        );
      }


      /*
       * Perlindungan terhadap double click /
       * request penerbitan berulang.
       */
      if (pengajuan.suratKeluar) {
        return pengajuan.suratKeluar;
      }


      if (pengajuan.status !== "DISETUJUI") {
        throw new Error(
          "Status pengajuan belum DISETUJUI."
        );
      }


      /*
       * Tentukan klasifikasi surat.
       *
       * SB = Surat Biasa
       * SK = Surat Keputusan
       */
      const kodeJenis = tentukanKodeJenis(
        pengajuan.jenis,
        pengajuan.kodeJenis
      );


      const tanggalSurat = new Date();


      /*
       * Nomor resmi BARU dibuat pada titik ini.
       */
      const nomor = await generateNomorSurat(
        tx,
        kodeJenis,
        tanggalSurat
      );


      /*
       * Membuat SuratKeluar.
       */
      const created =
        await tx.suratKeluar.create({
          data: {
            nomorSurat: nomor.nomorSurat,

            kodeJenis: nomor.kodeJenis,

            kodeNomor: nomor.kodeNomor,

            tujuan: pengajuan.tujuan,

            /*
             * Keperluan pengajuan digunakan sebagai
             * perihal surat.
             */
            perihal: pengajuan.keperluan,

            /*
             * Jika isi surat belum tersedia,
             * sementara gunakan keperluan.
             *
             * Nanti saat masuk tahap editor/PDF,
             * bagian ini dapat dibuat lebih lengkap.
             */
            isiSurat:
              pengajuan.isiSurat?.trim() ||
              pengajuan.keperluan,

            tanggalSurat,

            status: "DIPROSES",

            pengajuanId: pengajuan.id,
          },
        });


      /*
       * Simpan klasifikasi ke pengajuan.
       */
      await tx.pengajuanSurat.update({
        where: {
          id: pengajuan.id,
        },

        data: {
          kodeJenis: nomor.kodeJenis,
          kodeNomor: nomor.kodeNomor,
        },
      });


      /*
       * Audit.
       */
      await tx.auditLog.create({
        data: {
          userId: actor.id,

          aktivitas:
            `Menerbitkan surat ${created.nomorSurat} ` +
            `dari pengajuan ${pengajuan.id}`,
        },
      });


      return created;
    }
  );


  revalidatePath("/approval");
  revalidatePath("/surat");
  revalidatePath("/surat/keluar");
  revalidatePath(`/surat/${pengajuanId}`);


  redirect(`/surat/keluar/${suratKeluar.id}`);
}