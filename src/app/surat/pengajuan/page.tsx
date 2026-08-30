import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";


type PageProps = {
  searchParams: Promise<{
    revisi?: string;
  }>;
};


// ======================================================
// DATE INPUT FORMAT
// ======================================================

function formatInputDate(
  value: Date | null
) {
  if (!value) {
    return "";
  }


  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone:
          "Asia/Jakarta",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    ).formatToParts(
      value
    );


  const year =
    parts.find(
      (item) =>
        item.type === "year"
    )?.value ?? "";


  const month =
    parts.find(
      (item) =>
        item.type === "month"
    )?.value ?? "";


  const day =
    parts.find(
      (item) =>
        item.type === "day"
    )?.value ?? "";


  return `${year}-${month}-${day}`;
}


// ======================================================
// SUBMIT
// ======================================================

async function submitPengajuan(
  formData: FormData
) {
  "use server";


  const session =
    await getSession();


  if (!session?.id) {
    redirect("/login");
  }


  const userId =
    String(session.id);


  const jenis = String(
    formData.get("jenis") ?? ""
  ).trim();


  const tujuan = String(
    formData.get("tujuan") ?? ""
  ).trim();


  const keperluan = String(
    formData.get("keperluan") ?? ""
  ).trim();


  const revisiDariId = String(
    formData.get(
      "revisiDariId"
    ) ?? ""
  ).trim();


  const tanggalMulaiRaw = String(
    formData.get(
      "tanggalMulai"
    ) ?? ""
  ).trim();


  const tanggalSelesaiRaw = String(
    formData.get(
      "tanggalSelesai"
    ) ?? ""
  ).trim();


  if (
    !jenis ||
    !tujuan ||
    !keperluan
  ) {
    throw new Error(
      "Jenis surat, tujuan, dan keperluan wajib diisi."
    );
  }


  /*
   * Kalau ini revisi, pastikan
   * pengajuan lama memang milik user
   * dan statusnya DITOLAK.
   */
  if (revisiDariId) {
    const original =
      await prisma
        .pengajuanSurat
        .findFirst({
          where: {
            id:
              revisiDariId,

            userId,

            status:
              "DITOLAK",
          },
        });


    if (!original) {
      throw new Error(
        "Pengajuan yang akan diperbaiki tidak valid."
      );
    }
  }


  const tanggalMulai =
    tanggalMulaiRaw
      ? new Date(
          `${tanggalMulaiRaw}T00:00:00`
        )
      : null;


  const tanggalSelesai =
    tanggalSelesaiRaw
      ? new Date(
          `${tanggalSelesaiRaw}T00:00:00`
        )
      : null;


  if (
    tanggalMulai &&
    tanggalSelesai &&
    tanggalSelesai <
      tanggalMulai
  ) {
    throw new Error(
      "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."
    );
  }


  const created =
    await prisma
      .pengajuanSurat
      .create({
        data: {
          userId,

          jenis,

          tujuan,

          keperluan,

          tanggalMulai,

          tanggalSelesai,

          status:
            "DIAJUKAN",
        },
      });


  await prisma.auditLog.create({
    data: {
      userId,

      aktivitas:
        revisiDariId
          ? `Mengajukan ulang pengajuan ${revisiDariId} sebagai ${created.id}`
          : `Membuat pengajuan surat ${created.id}`,
    },
  });


  revalidatePath(
    "/surat/pengajuan"
  );

  revalidatePath(
    "/approval"
  );


  redirect(
    "/surat/pengajuan"
  );
}


// ======================================================
// STATUS
// ======================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles:
    Record<string, string> = {
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


function formatTanggal(
  value: Date
) {
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

export default async function PengajuanSuratPage({
  searchParams,
}: PageProps) {
  const session =
    await getSession();


  if (!session?.id) {
    redirect("/login");
  }


  const userId =
    String(session.id);


  const {
    revisi: revisiId,
  } = await searchParams;


  /*
   * Hanya ambil data revisi kalau:
   * - milik user
   * - status DITOLAK
   */
  const revisiData =
    revisiId
      ? await prisma
          .pengajuanSurat
          .findFirst({
            where: {
              id:
                revisiId,

              userId,

              status:
                "DITOLAK",
            },
          })
      : null;


  const revisiPenolakan =
    revisiData
      ? await prisma
          .approval
          .findFirst({
            where: {
              dataId:
                revisiData.id,

              status:
                "DITOLAK",
            },

            orderBy: {
              createdAt:
                "desc",
            },
          })
      : null;


  const pengajuan =
    await prisma
      .pengajuanSurat
      .findMany({
        where: {
          userId,
        },

        include: {
          suratKeluar: true,
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });


  const total =
    pengajuan.length;


  const aktif =
    pengajuan.filter(
      (item) =>
        item.status ===
          "DIAJUKAN" ||
        item.status ===
          "DIPROSES" ||
        item.status ===
          "DISETUJUI"
    ).length;


  const selesai =
    pengajuan.filter(
      (item) =>
        item.status ===
        "SELESAI"
    ).length;


  const ditolak =
    pengajuan.filter(
      (item) =>
        item.status ===
        "DITOLAK"
    ).length;


  return (
    <div
      className="
        mx-auto
        max-w-6xl
        space-y-8
      "
    >

      {/* HEADER */}

      <section>

        <p className="text-sm font-semibold text-cyan-600">
          Persuratan
        </p>


        <h1
          className="
            mt-1
            text-2xl
            font-extrabold
            text-slate-900
            sm:text-3xl
          "
        >
          Pengajuan Surat
        </h1>


        <p className="mt-2 text-sm text-slate-500">
          Ajukan surat baru dan pantau
          perkembangan pengajuan Anda.
        </p>

      </section>


      {/* SUMMARY */}

      <section
        className="
          grid
          grid-cols-2
          gap-4
          lg:grid-cols-4
        "
      >
        <SummaryCard
          icon={<FileText size={19} />}
          label="Total"
          value={total}
        />

        <SummaryCard
          icon={<Clock3 size={19} />}
          label="Diproses"
          value={aktif}
        />

        <SummaryCard
          icon={<CheckCircle2 size={19} />}
          label="Selesai"
          value={selesai}
        />

        <SummaryCard
          icon={<XCircle size={19} />}
          label="Ditolak"
          value={ditolak}
        />
      </section>


      {/* ==================================================
          MODE REVISI
      ================================================== */}

      {revisiData && (

        <section
          className="
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            p-5
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div className="flex gap-3">

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
                  text-amber-600
                "
              >
                <RefreshCw size={19} />
              </div>


              <div>

                <p className="font-bold text-amber-900">
                  Mode Perbaikan Pengajuan
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-amber-800
                  "
                >
                  Data pengajuan lama sudah
                  dimuat ke form. Perbaiki sesuai
                  catatan sekretaris lalu ajukan
                  kembali.
                </p>


                {revisiPenolakan?.catatan && (

                  <div
                    className="
                      mt-3
                      rounded-xl
                      bg-white/70
                      px-4
                      py-3
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-bold
                        uppercase
                        text-amber-600
                      "
                    >
                      Catatan Sekretaris
                    </p>

                    <p
                      className="
                        mt-1
                        whitespace-pre-wrap
                        text-sm
                        text-amber-900
                      "
                    >
                      {revisiPenolakan.catatan}
                    </p>
                  </div>

                )}

              </div>

            </div>


            <Link
              href="/surat/pengajuan"
              className="
                text-sm
                font-bold
                text-amber-800
                hover:underline
              "
            >
              Batalkan Revisi
            </Link>

          </div>
        </section>

      )}


      {/* ==================================================
          FORM
      ================================================== */}

      <form
        action={submitPengajuan}
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-slate-100
            px-6
            py-5
            sm:px-8
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-cyan-50
              text-cyan-600
            "
          >
            <FileText size={21} />
          </div>


          <div>

            <h2 className="font-bold text-slate-900">
              {revisiData
                ? "Perbaiki Pengajuan"
                : "Ajukan Surat Baru"}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {revisiData
                ? "Perbaiki data lalu kirim kembali ke Admin Sekretaris."
                : "Lengkapi data yang dibutuhkan untuk pengajuan."}
            </p>

          </div>
        </div>


        <div className="space-y-6 p-6 sm:p-8">

          {revisiData && (

            <input
              type="hidden"
              name="revisiDariId"
              value={revisiData.id}
            />

          )}


          {/* JENIS */}

          <div>

            <label
              htmlFor="jenis"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Jenis Surat *
            </label>


            <select
              id="jenis"
              name="jenis"
              required
              defaultValue={
                revisiData?.jenis ??
                ""
              }
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-sm
                text-slate-900
                outline-none
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            >
              <option
                value=""
                disabled
              >
                Pilih jenis surat
              </option>

              <option value="Surat Izin">
                Surat Izin
              </option>

              <option value="Surat Perjalanan Dinas">
                Surat Perjalanan Dinas
              </option>

              <option value="Surat Kegiatan">
                Surat Kegiatan
              </option>

              <option value="Surat Keterangan">
                Surat Keterangan
              </option>

              <option value="Surat Undangan">
                Surat Undangan
              </option>
            </select>

          </div>


          {/* TUJUAN */}

          <div>

            <label
              htmlFor="tujuan"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Tujuan Surat *
            </label>


            <div className="relative">

              <UserRound
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />


              <input
                id="tujuan"
                name="tujuan"
                required
                defaultValue={
                  revisiData?.tujuan ??
                  ""
                }
                placeholder="Contoh: Kepala Desa Sidodadi"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  text-slate-900
                  outline-none
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />

            </div>
          </div>


          {/* KEPERLUAN */}

          <div>

            <label
              htmlFor="keperluan"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Keperluan *
            </label>


            <textarea
              id="keperluan"
              name="keperluan"
              required
              rows={6}
              defaultValue={
                revisiData
                  ?.keperluan ??
                ""
              }
              placeholder="Jelaskan kebutuhan surat..."
              className="
                w-full
                resize-y
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-sm
                leading-7
                text-slate-900
                outline-none
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* TANGGAL */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
            "
          >

            <div>

              <label
                htmlFor="tanggalMulai"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Tanggal Mulai
              </label>


              <div className="relative">

                <CalendarDays
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />


                <input
                  id="tanggalMulai"
                  type="date"
                  name="tanggalMulai"
                  defaultValue={
                    formatInputDate(
                      revisiData
                        ?.tanggalMulai ??
                      null
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    text-slate-900
                    outline-none
                    focus:border-cyan-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-50
                  "
                />

              </div>
            </div>


            <div>

              <label
                htmlFor="tanggalSelesai"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Tanggal Selesai
              </label>


              <div className="relative">

                <CalendarDays
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />


                <input
                  id="tanggalSelesai"
                  type="date"
                  name="tanggalSelesai"
                  defaultValue={
                    formatInputDate(
                      revisiData
                        ?.tanggalSelesai ??
                      null
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    text-slate-900
                    outline-none
                    focus:border-cyan-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-50
                  "
                />

              </div>
            </div>

          </div>

        </div>


        <div
          className="
            flex
            justify-end
            border-t
            border-slate-100
            bg-slate-50/50
            px-6
            py-5
            sm:px-8
          "
        >
          <button
            type="submit"
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
            {revisiData
              ? (
                <RefreshCw
                  size={17}
                />
              )
              : (
                <Send
                  size={17}
                />
              )}


            {revisiData
              ? "Ajukan Ulang"
              : "Kirim Pengajuan"}
          </button>
        </div>

      </form>


      {/* ==================================================
          RIWAYAT
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

        <div
          className="
            border-b
            border-slate-100
            px-6
            py-5
          "
        >
          <h2 className="text-lg font-bold text-slate-900">
            Riwayat Pengajuan Saya
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Hanya pengajuan dari akun Anda.
          </p>
        </div>


        {pengajuan.length === 0 ? (

          <div className="px-6 py-14 text-center">

            <FileText
              size={30}
              className="mx-auto text-cyan-600"
            />

            <p className="mt-3 font-semibold text-slate-800">
              Belum ada pengajuan
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {pengajuan.map(
              (item) => (

                <article
                  key={item.id}
                  className="
                    p-5
                    transition
                    hover:bg-slate-50
                    sm:p-6
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    "
                  >

                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <StatusBadge
                          status={item.status}
                        />

                        <span className="text-xs text-slate-400">
                          {formatTanggal(
                            item.createdAt
                          )}
                        </span>
                      </div>


                      <h3
                        className="
                          mt-3
                          font-bold
                          text-slate-900
                        "
                      >
                        {item.jenis}
                      </h3>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        Tujuan:{" "}
                        {item.tujuan}
                      </p>


                      {item.suratKeluar && (

                        <p
                          className="
                            mt-2
                            text-xs
                            font-semibold
                            text-emerald-700
                          "
                        >
                          Nomor:{" "}
                          {
                            item
                              .suratKeluar
                              .nomorSurat
                          }
                        </p>

                      )}

                    </div>


                    <Link
                      href={`/surat/${item.id}`}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-bold
                        text-slate-700
                        transition
                        hover:bg-cyan-50
                        hover:text-cyan-700
                      "
                    >
                      Lihat Detail

                      <ArrowUpRight
                        size={15}
                      />
                    </Link>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;

  label: string;

  value: number;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-cyan-50
          text-cyan-600
        "
      >
        {icon}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}