import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Mail,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import type { StatusSurat } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  requireAuth,
  requireSekretaris,
} from "@/lib/permissions";

import { notFound, redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import DeleteSuratKeluarButton from "./DeleteSuratKeluarButton";


// ======================================================
// UPDATE STATUS SURAT
// ======================================================

async function updateStatus(
  formData: FormData
) {
  "use server";


  const actor =
    await requireSekretaris();


  const id = String(
    formData.get("id") ?? ""
  ).trim();


  const statusRaw = String(
    formData.get("status") ?? ""
  ).trim();


  if (!id) {
    throw new Error(
      "ID surat keluar tidak ditemukan."
    );
  }


  const allowedStatuses: StatusSurat[] = [
    "DIPROSES",
    "SELESAI",
  ];


  if (
    !allowedStatuses.includes(
      statusRaw as StatusSurat
    )
  ) {
    throw new Error(
      "Status surat keluar tidak valid."
    );
  }


  const surat =
    await prisma.suratKeluar.findUnique({
      where: {
        id,
      },
    });


  if (!surat) {
    throw new Error(
      "Surat keluar tidak ditemukan."
    );
  }


  const updated =
    await prisma.suratKeluar.update({
      where: {
        id,
      },

      data: {
        status:
          statusRaw as StatusSurat,
      },
    });


  /*
   * Jika surat sudah selesai,
   * pengajuan asal ikut selesai.
   */
  if (
    updated.status === "SELESAI" &&
    updated.pengajuanId
  ) {
    await prisma.pengajuanSurat.update({
      where: {
        id: updated.pengajuanId,
      },

      data: {
        status: "SELESAI",
      },
    });
  }


  await prisma.auditLog.create({
    data: {
      userId:
        actor.id,

      modul:
        "PERSURATAN",

      dataId:
        updated.id,

      aktivitas:
        `Mengubah status surat ${updated.nomorSurat} ` +
        `menjadi ${updated.status}`,
    },
  });


  revalidatePath(
    "/surat/keluar"
  );


  revalidatePath(
    `/surat/keluar/${id}`
  );


  revalidatePath(
    "/approval"
  );
}


// ======================================================
// HAPUS SURAT KELUAR
// Hanya selama DIPROSES.
// Nomor surat yang sudah pernah terbit TIDAK diulang.
// ======================================================

async function hapusSuratKeluar(
  formData: FormData
) {
  "use server";


  const actor =
    await requireSekretaris();


  const id = String(
    formData.get("id") ?? ""
  ).trim();


  if (!id) {
    throw new Error(
      "ID surat keluar tidak ditemukan."
    );
  }


  const surat =
    await prisma.suratKeluar.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        nomorSurat: true,
        status: true,
        pengajuanId: true,
      },
    });


  if (!surat) {
    throw new Error(
      "Surat keluar tidak ditemukan."
    );
  }


  /*
   * Arsip yang sudah SELESAI adalah dokumen final
   * dan tidak boleh dihapus.
   */
  if (
    surat.status !== "DIPROSES"
  ) {
    throw new Error(
      "Surat keluar yang sudah selesai tidak dapat dihapus."
    );
  }


  /*
   * Counter nomor surat tidak diturunkan.
   * Nomor yang pernah dialokasikan tidak digunakan ulang
   * agar jejak administrasi tetap konsisten.
   */
  await prisma.$transaction(
    async (tx) => {
      await tx.suratKeluar.delete({
        where: {
          id:
            surat.id,
        },
      });


      await tx.auditLog.create({
        data: {
          userId:
            actor.id,

          modul:
            "PERSURATAN",

          dataId:
            surat.id,

          aktivitas:
            `Menghapus surat keluar ${surat.nomorSurat}`,
        },
      });
    }
  );


  revalidatePath(
    "/surat/keluar"
  );


  revalidatePath(
    "/approval"
  );


  revalidatePath(
    "/surat/pengajuan"
  );


  if (
    surat.pengajuanId
  ) {
    revalidatePath(
      `/surat/${surat.pengajuanId}`
    );
  }


  redirect(
    "/surat/keluar"
  );
}


// ======================================================
// STATUS BADGE
// ======================================================

function Badge({
  status,
}: {
  status: string;
}) {
  const color: Record<
    string,
    string
  > = {
    DRAFT:
      "border-slate-200 bg-slate-50 text-slate-600",

    DIAJUKAN:
      "border-amber-200 bg-amber-50 text-amber-700",

    DIPROSES:
      "border-cyan-200 bg-cyan-50 text-cyan-700",

    DISETUJUI:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    DITOLAK:
      "border-red-200 bg-red-50 text-red-700",

    SELESAI:
      "border-purple-200 bg-purple-50 text-purple-700",
  };


  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-bold
        ${
          color[status] ??
          color.DRAFT
        }
      `}
    >
      {status}
    </span>
  );
}


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(
  tanggal: Date
) {
  return tanggal.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


// ======================================================
// NEXT.JS 16 PARAMS
// ======================================================

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// DETAIL SURAT KELUAR
// ======================================================

export default async function DetailSuratKeluar({
  params,
}: PageProps) {
  const user =
    await requireAuth();


  const { id } =
    await params;


  if (!id) {
    notFound();
  }


  const surat =
    await prisma.suratKeluar.findUnique({
      where: {
        id,
      },

      include: {
        pengajuan: {
          include: {
            user: true,
          },
        },
      },
    });


  if (!surat) {
    notFound();
  }


  const isSekretaris =
    user.role === "SUPERADMIN" ||
    user.role === "ADMIN_SEKRETARIS";
  return (
    <div
      className="
        mx-auto
        max-w-6xl
        space-y-6
      "
    >

      {/* KEMBALI */}

      <Link
        href="/surat/keluar"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-500
          transition
          hover:text-cyan-700
        "
      >
        <ArrowLeft size={17} />

        Kembali ke Surat Keluar
      </Link>


      {/* DETAIL SURAT */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {/* HEADER */}

        <div
          className="
            bg-gradient-to-r
            from-cyan-600
            to-teal-500
            px-6
            py-7
            text-white
            sm:px-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-cyan-50
                "
              >
                Surat Keluar
              </p>


              <h1
                className="
                  mt-2
                  break-words
                  text-2xl
                  font-extrabold
                  tracking-tight
                  sm:text-3xl
                "
              >
                {surat.nomorSurat}
              </h1>


              <p
                className="
                  mt-2
                  text-sm
                  text-cyan-50
                "
              >
                Surat resmi organisasi KAMOO
              </p>

            </div>


            <Badge
              status={surat.status}
            />

          </div>
        </div>


        {/* BODY */}

        <div
          className="
            p-6
            sm:p-8
          "
        >

          {/* INFO */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >

            <InfoCard
              icon={
                <FileText size={19} />
              }
              label="Nomor Surat"
              value={surat.nomorSurat}
            />


            <InfoCard
              icon={
                <CalendarDays size={19} />
              }
              label="Tanggal Surat"
              value={formatTanggal(
                surat.tanggalSurat
              )}
            />


            <InfoCard
              icon={
                <Mail size={19} />
              }
              label="Tujuan"
              value={surat.tujuan}
            />


            <InfoCard
              icon={
                <ShieldCheck size={19} />
              }
              label="Jenis Surat"
              value={
                surat.kodeJenis
                  ? `${surat.kodeJenis}${
                      surat.kodeNomor
                        ? ` / ${surat.kodeNomor}`
                        : ""
                    }`
                  : "-"
              }
            />

          </div>


          {/* PERIHAL */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Perihal
            </p>

            <p
              className="
                mt-2
                text-sm
                font-semibold
                text-slate-800
              "
            >
              {surat.perihal}
            </p>
          </div>


          {/* ISI SURAT */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Isi Surat
            </p>

            <p
              className="
                mt-3
                whitespace-pre-wrap
                text-sm
                leading-7
                text-slate-700
              "
            >
              {surat.isiSurat}
            </p>
          </div>


          {/* PDF */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-cyan-200
              bg-cyan-50
              p-5
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-cyan-600
                    shadow-sm
                  "
                >
                  <FileText size={20} />
                </div>


                <div>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-slate-900
                    "
                  >
                    Dokumen Surat PDF
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-slate-600
                    "
                  >
                    PDF otomatis menggunakan
                    redaksi terbaru dari database.
                  </p>

                </div>
              </div>


              <a
                href={`/api/surat/keluar/${surat.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-cyan-600
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-cyan-700
                  sm:w-auto
                "
              >
                <FileText size={17} />

                Lihat PDF Surat
              </a>

            </div>
          </div>


          {/* SUMBER PENGAJUAN */}

          {surat.pengajuan && (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-cyan-100
                bg-cyan-50
                p-5
              "
            >

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-cyan-600
                "
              >
                Sumber Pengajuan
              </p>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {
                  surat
                    .pengajuan
                    .user
                    .nama
                }
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                {
                  surat
                    .pengajuan
                    .keperluan
                }
              </p>


              <Link
                href={`/surat/${surat.pengajuan.id}`}
                className="
                  mt-3
                  inline-flex
                  text-sm
                  font-bold
                  text-cyan-700
                  hover:text-cyan-800
                "
              >
                Lihat pengajuan
              </Link>

            </div>

          )}

        </div>

      </section>


      {/* ==================================================
          AKSI SURAT
      ================================================== */}

      {isSekretaris &&
      surat.status ===
        "DIPROSES" && (

        <section
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            sm:p-7
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Kelola Surat
              </h2>

              <p
                className="
                  mt-1
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Surat masih DIPROSES sehingga
                redaksi masih dapat diperbarui
                atau arsip dapat dibatalkan.
              </p>
            </div>


            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
              "
            >
              <Link
                href={`/surat/keluar/${surat.id}/edit`}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:border-cyan-200
                  hover:bg-cyan-50
                  hover:text-cyan-700
                "
              >
                <Pencil
                  size={16}
                />

                Edit
              </Link>


              <DeleteSuratKeluarButton
                id={
                  surat.id
                }
                nomorSurat={
                  surat.nomorSurat
                }
                action={
                  hapusSuratKeluar
                }
              />
            </div>
          </div>


          <div
            className="
              mt-4
              rounded-2xl
              border
              border-amber-100
              bg-amber-50
              px-4
              py-3
              text-xs
              leading-5
              text-amber-700
            "
          >
            Jika surat dihapus, nomor surat yang
            sudah pernah dialokasikan tidak akan
            digunakan ulang.
          </div>
        </section>

      )}


      {/* ==================================================
          STATUS SURAT
      ================================================== */}

      {isSekretaris && (

        <section
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            sm:p-7
          "
        >

          <h2
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            Status Surat
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Selesaikan surat setelah redaksi
            dan PDF final sudah diperiksa.
          </p>


          {surat.status ===
            "DIPROSES" && (

            <div
              className="
                mt-5
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-cyan-200
                bg-cyan-50
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <p
                  className="
                    font-bold
                    text-cyan-800
                  "
                >
                  Surat masih dapat diedit
                </p>


                <p
                  className="
                    mt-1
                    max-w-xl
                    text-sm
                    leading-6
                    text-cyan-700
                  "
                >
                  Periksa redaksi dan PDF terlebih
                  dahulu. Setelah Tandai Selesai
                  ditekan, redaksi akan dikunci.
                </p>

              </div>


              <form
                action={updateStatus}
              >

                <input
                  type="hidden"
                  name="id"
                  value={surat.id}
                />


                <input
                  type="hidden"
                  name="status"
                  value="SELESAI"
                />


                <button
                  type="submit"
                  className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                    sm:w-auto
                  "
                >
                  <CheckCircle2 size={17} />

                  Tandai Selesai
                </button>

              </form>

            </div>

          )}


          {surat.status ===
            "SELESAI" && (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  font-bold
                  text-emerald-800
                "
              >
                <CheckCircle2 size={19} />

                Surat selesai
              </div>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-emerald-700
                "
              >
                Redaksi telah dikunci karena
                surat sudah berstatus selesai.
              </p>

            </div>

          )}

        </section>

      )}

    </div>
  );
}


// ======================================================
// INFO CARD
// ======================================================

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-cyan-50
          text-cyan-600
        "
      >
        {icon}
      </div>


      <div className="min-w-0">

        <p
          className="
            text-xs
            font-medium
            text-slate-400
          "
        >
          {label}
        </p>


        <p
          className="
            mt-1
            break-words
            text-sm
            font-semibold
            text-slate-800
          "
        >
          {value}
        </p>

      </div>

    </div>
  );
}