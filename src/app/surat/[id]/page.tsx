import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Mail,
  RefreshCw,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  notFound,
  redirect,
} from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";

import { terbitkanSurat } from "../actions";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
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
        ${styles[status] ?? styles.DRAFT}
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
  value: Date | null | undefined
) {
  if (!value) {
    return "-";
  }


  return value.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function DetailPengajuanPage({
  params,
}: PageProps) {
  const user = await requireAuth();

  const { id } = await params;


  if (!id) {
    notFound();
  }


  const pengajuan =
    await prisma.pengajuanSurat.findUnique({
      where: {
        id,
      },

      include: {
        user: true,

        suratKeluar: true,
      },
    });


  if (!pengajuan) {
    notFound();
  }


  const isSekretaris =
    user.role === "SUPERADMIN" ||
    user.role === "ADMIN_SEKRETARIS";


  /*
   * User biasa hanya boleh melihat
   * pengajuannya sendiri.
   */
  if (
    !isSekretaris &&
    pengajuan.userId !== user.id
  ) {
    redirect("/surat/pengajuan");
  }


  // ====================================================
  // ALASAN PENOLAKAN
  // ====================================================

  const penolakan =
    pengajuan.status === "DITOLAK"
      ? await prisma.approval.findFirst({
          where: {
            dataId: pengajuan.id,

            status: "DITOLAK",
          },

          include: {
            user: {
              select: {
                nama: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        })
      : null;


  const suratSudahFinal =
    pengajuan.suratKeluar?.status ===
    "SELESAI";


  return (
    <div
      className="
        mx-auto
        max-w-6xl
        space-y-6
      "
    >

      {/* BACK */}

      <Link
        href={
          isSekretaris
            ? "/approval"
            : "/surat/pengajuan"
        }
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

        Kembali
      </Link>


      {/* ==================================================
          DETAIL
      ================================================== */}

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

              <p className="text-sm font-semibold text-cyan-50">
                Detail Pengajuan Surat
              </p>


              <h1
                className="
                  mt-2
                  text-2xl
                  font-extrabold
                  tracking-tight
                  sm:text-3xl
                "
              >
                {pengajuan.jenis}
              </h1>


              <p className="mt-2 text-sm text-cyan-50">
                Diajukan oleh{" "}
                {pengajuan.user.nama}
              </p>

            </div>


            <StatusBadge
              status={pengajuan.status}
            />

          </div>
        </div>


        <div className="p-6 sm:p-8">

          {/* ==================================================
              DITOLAK
          ================================================== */}

          {pengajuan.status ===
            "DITOLAK" && (

            <div
              className="
                mb-6
                overflow-hidden
                rounded-2xl
                border
                border-red-200
                bg-red-50
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                  border-b
                  border-red-100
                  px-5
                  py-4
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
                    bg-white
                    text-red-600
                    shadow-sm
                  "
                >
                  <XCircle size={20} />
                </div>


                <div>

                  <p className="font-bold text-red-800">
                    Pengajuan Ditolak
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-red-700
                    "
                  >
                    Perbaiki pengajuan berdasarkan
                    catatan Admin Sekretaris.
                  </p>

                </div>
              </div>


              <div className="p-5">

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-red-500
                  "
                >
                  Alasan Penolakan
                </p>


                <p
                  className="
                    mt-2
                    whitespace-pre-wrap
                    text-sm
                    font-medium
                    leading-7
                    text-red-900
                  "
                >
                  {penolakan?.catatan?.trim()
                    ? penolakan.catatan
                    : "Tidak ada catatan penolakan."}
                </p>


                {penolakan && (

                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      gap-x-5
                      gap-y-2
                      border-t
                      border-red-100
                      pt-4
                      text-xs
                      text-red-600
                    "
                  >
                    <span>
                      Ditinjau oleh:{" "}
                      <strong>
                        {penolakan.user.nama}
                      </strong>
                    </span>

                    <span>
                      {formatTanggal(
                        penolakan.createdAt
                      )}
                    </span>
                  </div>

                )}


                {!isSekretaris && (

                  <Link
                    href={`/surat/pengajuan?revisi=${pengajuan.id}`}
                    className="
                      mt-5
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-red-600
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-red-700
                    "
                  >
                    <RefreshCw size={17} />

                    Perbaiki & Ajukan Ulang
                  </Link>

                )}

              </div>

            </div>

          )}


          {/* ==================================================
              INFO
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >

            <InfoCard
              icon={<UserRound size={19} />}
              title="Pemohon"
              value={pengajuan.user.nama}
            />


            <InfoCard
              icon={<Mail size={19} />}
              title="Tujuan"
              value={pengajuan.tujuan}
            />


            <InfoCard
              icon={<FileText size={19} />}
              title="Jenis Surat"
              value={pengajuan.jenis}
            />


            <InfoCard
              icon={<Clock3 size={19} />}
              title="Tanggal Pengajuan"
              value={formatTanggal(
                pengajuan.createdAt
              )}
            />

          </div>


          {/* KEPERLUAN */}

          <div
            className="
              mt-6
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
              Keperluan
            </p>


            <p
              className="
                mt-2
                whitespace-pre-wrap
                text-sm
                leading-7
                text-slate-700
              "
            >
              {pengajuan.keperluan}
            </p>
          </div>


          {/* PERIODE */}

          {(
            pengajuan.tanggalMulai ||
            pengajuan.tanggalSelesai
          ) && (

            <div
              className="
                mt-5
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >

              <InfoCard
                icon={
                  <CalendarDays size={19} />
                }
                title="Tanggal Mulai"
                value={formatTanggal(
                  pengajuan.tanggalMulai
                )}
              />


              <InfoCard
                icon={
                  <CalendarDays size={19} />
                }
                title="Tanggal Selesai"
                value={formatTanggal(
                  pengajuan.tanggalSelesai
                )}
              />

            </div>

          )}


          {/* ==================================================
              SURAT TERBIT / FINAL
          ================================================== */}

          {pengajuan.suratKeluar && (

            <div
              className="
                mt-6
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
                  flex-col
                  gap-5
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >

                <div>

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

                    {suratSudahFinal
                      ? "Surat Telah Selesai"
                      : "Surat Telah Diterbitkan"}
                  </div>


                  <p
                    className="
                      mt-3
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-600
                    "
                  >
                    Nomor Surat
                  </p>


                  <p
                    className="
                      mt-1
                      break-words
                      text-sm
                      font-bold
                      text-slate-900
                    "
                  >
                    {
                      pengajuan
                        .suratKeluar
                        .nomorSurat
                    }
                  </p>


                  {!suratSudahFinal &&
                    !isSekretaris && (

                    <p
                      className="
                        mt-2
                        text-sm
                        text-emerald-700
                      "
                    >
                      Surat masih difinalisasi oleh
                      Admin Sekretaris. PDF final
                      tersedia setelah proses selesai.
                    </p>

                  )}

                </div>


                {/* USER: PDF FINAL */}

                {!isSekretaris &&
                  suratSudahFinal && (

                  <div
                    className="
                      flex
                      w-full
                      flex-col
                      gap-2
                      sm:w-auto
                      sm:flex-row
                    "
                  >

                    <a
                      href={`/api/surat/keluar/${pengajuan.suratKeluar.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-emerald-200
                        bg-white
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-emerald-700
                        transition
                        hover:bg-emerald-100
                      "
                    >
                      <ExternalLink size={16} />

                      Buka PDF
                    </a>


                    <a
                      href={`/api/surat/keluar/${pengajuan.suratKeluar.id}/pdf?download=1`}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-emerald-600
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-emerald-700
                      "
                    >
                      <Download size={16} />

                      Download PDF
                    </a>

                  </div>

                )}


                {/* SEKRETARIS */}

                {isSekretaris && (

                  <Link
                    href={`/surat/keluar/${pengajuan.suratKeluar.id}`}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-600
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      transition
                      hover:bg-emerald-700
                    "
                  >
                    Kelola Surat Keluar
                  </Link>

                )}

              </div>

            </div>

          )}

        </div>

      </section>


      {/* ==================================================
          SEKRETARIS
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

          <h2 className="text-lg font-bold text-slate-900">
            Penerbitan Surat
          </h2>


          <p className="mt-1 text-sm text-slate-500">
            Surat hanya dapat diterbitkan setelah
            pengajuan disetujui.
          </p>


          {pengajuan.status ===
            "DIAJUKAN" && (

            <InfoStatus
              type="warning"
              title="Menunggu review"
              description="Pengajuan belum mulai diproses."
            />

          )}


          {pengajuan.status ===
            "DIPROSES" &&
            !pengajuan.suratKeluar && (

            <InfoStatus
              type="info"
              title="Sedang diproses"
              description="Pengajuan sedang dalam tahap review sekretaris."
            />

          )}


          {pengajuan.status ===
            "DITOLAK" && (

            <InfoStatus
              type="error"
              title="Pengajuan ditolak"
              description="Pengajuan ini tidak dapat diterbitkan menjadi Surat Keluar."
            />

          )}


          {pengajuan.status ===
            "DISETUJUI" &&
            !pengajuan.suratKeluar && (

            <div
              className="
                mt-5
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <p className="font-bold text-emerald-800">
                  Siap diterbitkan
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-emerald-700
                  "
                >
                  Nomor resmi akan dibuat otomatis
                  saat surat diterbitkan.
                </p>

              </div>


              <form action={terbitkanSurat}>

                <input
                  type="hidden"
                  name="pengajuanId"
                  value={pengajuan.id}
                />


                <button
                  type="submit"
                  className="
                    inline-flex
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
                  "
                >
                  <Send size={17} />

                  Terbitkan Surat
                </button>

              </form>

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
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
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

        <p className="text-xs font-medium text-slate-400">
          {title}
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


// ======================================================
// INFO STATUS
// ======================================================

function InfoStatus({
  type,
  title,
  description,
}: {
  type:
    | "warning"
    | "info"
    | "error";

  title: string;
  description: string;
}) {
  const styles = {
    warning:
      "border-amber-200 bg-amber-50 text-amber-800",

    info:
      "border-cyan-200 bg-cyan-50 text-cyan-800",

    error:
      "border-red-200 bg-red-50 text-red-800",
  };


  return (
    <div
      className={`
        mt-5
        rounded-2xl
        border
        p-5
        ${styles[type]}
      `}
    >
      <div className="flex items-start gap-3">

        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0"
        />

        <div>

          <p className="font-bold">
            {title}
          </p>

          <p
            className="
              mt-1
              text-sm
              leading-6
              opacity-80
            "
          >
            {description}
          </p>

        </div>

      </div>
    </div>
  );
}