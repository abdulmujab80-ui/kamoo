"use server";

import { prisma } from "@/lib/prisma";

import {
  requireSekretaris,
} from "@/lib/permissions";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";


export async function mulaiProses(
  formData: FormData
) {

  const user =
    await requireSekretaris();


  const id =
    String(
      formData.get("id")
    );


  const pengajuan =
    await prisma.pengajuanSurat.findUnique({
      where: {
        id,
      },
    });


  if (!pengajuan) {
    throw new Error(
      "Pengajuan surat tidak ditemukan."
    );
  }


  if (pengajuan.status !== "DIAJUKAN") {
    throw new Error(
      "Pengajuan ini sudah diproses."
    );
  }


  await prisma.$transaction([

    prisma.pengajuanSurat.update({
      where: {
        id,
      },

      data: {
        status: "DIPROSES",
      },
    }),


    prisma.auditLog.create({
      data: {
        userId: user.id,

        aktivitas:
          `Mulai memproses pengajuan surat ${id}`,
      },
    }),

  ]);


  revalidatePath("/approval");
  revalidatePath(`/surat/${id}`);
}




export async function setujuiPengajuan(
  formData: FormData
) {

  const user =
    await requireSekretaris();


  const id =
    String(
      formData.get("id")
    );


  const catatan =
    String(
      formData.get("catatan") ?? ""
    ).trim();


  const pengajuan =
    await prisma.pengajuanSurat.findUnique({
      where: {
        id,
      },
    });


  if (!pengajuan) {
    throw new Error(
      "Pengajuan surat tidak ditemukan."
    );
  }


  if (
    pengajuan.status !== "DIAJUKAN" &&
    pengajuan.status !== "DIPROSES"
  ) {
    throw new Error(
      "Status pengajuan tidak dapat disetujui."
    );
  }


  await prisma.$transaction([

    prisma.pengajuanSurat.update({
      where: {
        id,
      },

      data: {
        status: "DISETUJUI",
      },
    }),


    prisma.approval.create({
      data: {
        modul: "PENGAJUAN_SURAT",

        dataId: id,

        status: "DISETUJUI",

        catatan:
          catatan ||
          "Pengajuan surat disetujui.",

        userId: user.id,
      },
    }),


    prisma.auditLog.create({
      data: {
        userId: user.id,

        aktivitas:
          `Menyetujui pengajuan surat ${id}`,
      },
    }),

  ]);


  revalidatePath("/approval");
  revalidatePath("/surat");
  revalidatePath(`/surat/${id}`);
}




export async function tolakPengajuan(
  formData: FormData
) {

  const user =
    await requireSekretaris();


  const id =
    String(
      formData.get("id")
    );


  const catatan =
    String(
      formData.get("catatan") ?? ""
    ).trim();


  if (!catatan) {
    throw new Error(
      "Alasan penolakan wajib diisi."
    );
  }


  const pengajuan =
    await prisma.pengajuanSurat.findUnique({
      where: {
        id,
      },
    });


  if (!pengajuan) {
    throw new Error(
      "Pengajuan surat tidak ditemukan."
    );
  }


  if (
    pengajuan.status !== "DIAJUKAN" &&
    pengajuan.status !== "DIPROSES"
  ) {
    throw new Error(
      "Pengajuan ini tidak dapat ditolak."
    );
  }


  await prisma.$transaction([

    prisma.pengajuanSurat.update({
      where: {
        id,
      },

      data: {
        status: "DITOLAK",
      },
    }),


    prisma.approval.create({
      data: {
        modul: "PENGAJUAN_SURAT",

        dataId: id,

        status: "DITOLAK",

        catatan,

        userId: user.id,
      },
    }),


    prisma.auditLog.create({
      data: {
        userId: user.id,

        aktivitas:
          `Menolak pengajuan surat ${id}: ${catatan}`,
      },
    }),

  ]);


  revalidatePath("/approval");
  revalidatePath("/surat");
  revalidatePath(`/surat/${id}`);
}