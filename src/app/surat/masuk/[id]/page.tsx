import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  PlayCircle,
  Trash2,
} from "lucide-react";

import type { StatusSurat } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  requireSekretaris,
} from "@/lib/permissions";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";


// ======================================================
// PAGE PROPS
// NEXT.JS 16: params ADALAH PROMISE
// ======================================================

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// UPDATE STATUS
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
      "ID surat masuk tidak ditemukan."
    );
  }


  const allowedStatus: StatusSurat[] = [
    "DIPROSES",
    "SELESAI",
  ];


  if (
    !allowedStatus.includes(
      statusRaw as StatusSurat
    )
  ) {
    throw new Error(
      "Status surat masuk tidak valid."
    );
  }


  const surat =
    await prisma.suratMasuk.findUnique({
      where: {
        id,
      },
    });


  if (!surat) {
    throw new Error(
      "Surat masuk tidak ditemukan."
    );
  }


  /*
   * Alur yang diperbolehkan:
   *
   * DIAJUKAN -> DIPROSES
   * DIPROSES -> SELESAI
   *
   * DIAJUKAN hanya untuk kompatibilitas
   * record lama sebelum workflow diperbaiki.
   */

  if (
    statusRaw === "DIPROSES" &&
    surat.status !== "DIAJUKAN" &&
    surat.status !== "DRAFT"
  ) {
    throw new Error(
      "Surat ini tidak dapat dipindahkan ke status DIPROSES."
    );
  }


  if (
    statusRaw === "SELESAI" &&
    surat.status !== "DIPROSES"
  ) {
    throw new Error(
      "Surat harus berstatus DIPROSES sebelum diselesaikan."
    );
  }


  const updated =
    await prisma.suratMasuk.update({
      where: {
        id,
      },

      data: {
        status:
          statusRaw as StatusSurat,
      },
    });


  await prisma.auditLog.create({
    data: {
      userId:
        actor.id,

      aktivitas:
        `Mengubah status surat masuk ${updated.nomorSurat} ` +
        `menjadi ${updated.status}`,
    },
  });


  revalidatePath(
    "/surat/masuk"
  );


  revalidatePath(
    `/surat/masuk/${id}`
  );


  revalidatePath(
    "/surat"
  );
}


// ======================================================
// HAPUS SURAT
// ======================================================

async function hapusSurat(
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
      "ID surat masuk tidak ditemukan."
    );
  }


  const surat =
    await prisma.suratMasuk.findUnique({
      where: {
        id,
      },
    });


  if (!surat) {
    throw new Error(
      "Surat masuk tidak ditemukan."
    );
  }


  /*
   * Simpan audit terlebih dahulu,
   * karena record surat akan dihapus.
   */
  await prisma.auditLog.create({
    data: {
      userId:
        actor.id,

      aktivitas:
        `Menghapus surat masuk ${surat.nomorSurat} dari ${surat.asal}`,
    },
  });


  await prisma.suratMasuk.delete({
    where: {
      id,
    },
  });


  revalidatePath(
    "/surat/masuk"
  );


  revalidatePath(
    "/surat"
  );


  redirect(
    "/surat/masuk"
  );
}


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
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
          styles[status] ??
          styles.DRAFT
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
// PAGE
// ======================================================

export default async function DetailSuratMasuk({
  params,
}: PageProps) {
  /*
   * Backend RBAC.
   *
   * Hanya:
   * SUPERADMIN
   * ADMIN_SEKRETARIS
   */
  await requireSekretaris();


  /*
   * FIX UTAMA NEXT.JS 16
   */
  const { id } =
    await params;


  if (!id) {
    notFound();
  }


  const surat =
    await prisma.suratMasuk.findUnique({
      where: {
        id,
      },
    });


  if (!surat) {
    notFound();
  }


  const isLegacyStatus =
    surat.status === "DIAJUKAN" ||
    surat.status === "DRAFT";


  const isDiproses =
    surat.status === "DIPROSES";


  const isSelesai =
    surat.status === "SELESAI";


  return (
    <div
      className="
        mx-auto
        max-w-6xl
        space-y-6
      "
    >

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href="/surat/masuk"
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

        Kembali ke Surat Masuk
      </Link>


      {/* ==================================================
          HEADER + DETAIL
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

              <p
                className="
                  text-sm
                  font-semibold
                  text-cyan-50
                "
              >
                Detail Surat Masuk
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
                Surat diterima dari{" "}
                {surat.asal}
              </p>

            </div>


            <StatusBadge
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

          {/* ==================================================
              INFO
          ================================================== */}

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
                <Building2 size={19} />
              }
              label="Asal Surat"
              value={surat.asal}
            />


            <InfoCard
              icon={
                <CheckCircle2 size={19} />
              }
              label="Status"
              value={surat.status}
            />

          </div>


          {/* ==================================================
              PERIHAL
          ================================================== */}

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
                whitespace-pre-wrap
                text-sm
                leading-7
                text-slate-700
              "
            >
              {surat.perihal}
            </p>

          </div>


          {/* ==================================================
              DOKUMEN
          ================================================== */}

          {surat.fileUrl ? (

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
                        font-bold
                        text-slate-900
                      "
                    >
                      Dokumen Surat
                    </p>


                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      Dokumen digital surat masuk
                      tersedia untuk dibuka.
                    </p>

                  </div>

                </div>


                <a
                  href={surat.fileUrl}
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
                  <ExternalLink size={17} />

                  Buka Dokumen
                </a>

              </div>
            </div>

          ) : (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-slate-50
                p-5
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                Tidak ada dokumen digital
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-400
                "
              >
                Surat ini tercatat tanpa tautan
                file lampiran.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ==================================================
          STATUS WORKFLOW
      ================================================== */}

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
          Status Surat Masuk
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Kelola proses administrasi surat
          sampai selesai diarsipkan.
        </p>


        {/* RECORD LAMA DIAJUKAN */}

        {isLegacyStatus && (

          <div
            className="
              mt-5
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-amber-200
              bg-amber-50
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
                  text-amber-800
                "
              >
                Record lama perlu diproses
              </p>


              <p
                className="
                  mt-1
                  max-w-xl
                  text-sm
                  leading-6
                  text-amber-700
                "
              >
                Surat ini dibuat sebelum workflow
                Surat Masuk diperbarui. Mulai proses
                untuk memasukkannya ke alur
                administrasi yang baru.
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
                value="DIPROSES"
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
                  bg-amber-600
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-amber-700
                  sm:w-auto
                "
              >
                <PlayCircle size={17} />

                Mulai Proses
              </button>

            </form>

          </div>

        )}


        {/* DIPROSES */}

        {isDiproses && (

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
                Surat sedang diproses
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
                Setelah surat selesai ditindaklanjuti
                dan siap menjadi arsip final,
                tandai surat sebagai selesai.
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


        {/* SELESAI */}

        {isSelesai && (

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
              Surat telah selesai diproses dan
              tercatat sebagai arsip surat masuk.
            </p>

          </div>

        )}

      </section>


      {/* ==================================================
          ADMIN ACTION
      ================================================== */}

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
          Kelola Data
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Perbaiki data apabila terjadi
          kesalahan pencatatan.
        </p>


        <div
          className="
            mt-5
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >

          <Link
            href={`/surat/masuk/${surat.id}/edit`}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-5
              py-3
              text-sm
              font-bold
              text-amber-700
              transition
              hover:bg-amber-100
            "
          >
            <Edit3 size={17} />

            Edit Data
          </Link>


          <form
            action={hapusSurat}
          >

            <input
              type="hidden"
              name="id"
              value={surat.id}
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
                border
                border-red-200
                bg-red-50
                px-5
                py-3
                text-sm
                font-bold
                text-red-700
                transition
                hover:bg-red-100
                sm:w-auto
              "
            >
              <Trash2 size={17} />

              Hapus Surat
            </button>

          </form>

        </div>

      </section>

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


      <div
        className="
          min-w-0
        "
      >

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