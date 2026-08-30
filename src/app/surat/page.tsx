import Link from "next/link";

import {
  ArrowUpRight,
  FileInput,
  FileOutput,
  FileText,
  FolderOpen,
  Plus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireSekretaris } from "@/lib/permissions";


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
  tanggal: Date
) {
  return tanggal.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function SuratPage() {
  /*
   * PENTING:
   *
   * Route /surat hanya boleh dibuka oleh:
   * - SUPERADMIN
   * - ADMIN_SEKRETARIS
   *
   * Jadi anggota/pengurus yang mengetik URL
   * /surat secara manual tetap tidak bisa masuk.
   */
  await requireSekretaris();


  const [
    suratMasuk,
    suratKeluar,
    pengajuan,
  ] = await Promise.all([
    prisma.suratMasuk.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),


    prisma.suratKeluar.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),


    prisma.pengajuanSurat.findMany({
      include: {
        user: true,

        suratKeluar: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);


  // ====================================================
  // SATUKAN RIWAYAT
  // ====================================================

  const data = [
    ...suratMasuk.map(
      (item) => ({
        id: item.id,

        key:
          `surat-masuk-${item.id}`,

        jenis:
          "Surat Masuk",

        nomor:
          item.nomorSurat,

        perihal:
          item.perihal,

        status:
          item.status,

        tanggal:
          item.tanggalSurat,

        keterangan:
          item.asal,

        link:
          `/surat/masuk/${item.id}`,
      })
    ),


    ...suratKeluar.map(
      (item) => ({
        id: item.id,

        key:
          `surat-keluar-${item.id}`,

        jenis:
          "Surat Keluar",

        nomor:
          item.nomorSurat,

        perihal:
          item.perihal,

        status:
          item.status,

        tanggal:
          item.tanggalSurat,

        keterangan:
          item.tujuan,

        link:
          `/surat/keluar/${item.id}`,
      })
    ),


    ...pengajuan.map(
      (item) => ({
        id: item.id,

        key:
          `pengajuan-${item.id}`,

        jenis:
          "Pengajuan",

        nomor:
          item.suratKeluar
            ?.nomorSurat ?? "-",

        perihal:
          item.keperluan,

        status:
          item.status,

        tanggal:
          item.createdAt,

        keterangan:
          item.user.nama,

        link:
          `/surat/${item.id}`,
      })
    ),
  ];


  /*
   * Karena data berasal dari tiga tabel,
   * urutkan ulang berdasarkan tanggal.
   */
  data.sort(
    (a, b) =>
      b.tanggal.getTime() -
      a.tanggal.getTime()
  );


  const totalData =
    data.length;


  const totalMasuk =
    suratMasuk.length;


  const totalKeluar =
    suratKeluar.length;


  const totalPengajuan =
    pengajuan.length;


  return (
    <div className="space-y-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <section
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>

          <p
            className="
              text-sm
              font-semibold
              text-cyan-600
            "
          >
            Persuratan
          </p>


          <h1
            className="
              mt-1
              text-2xl
              font-extrabold
              tracking-tight
              text-slate-900
              sm:text-3xl
            "
          >
            Riwayat Persuratan
          </h1>


          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            Riwayat seluruh surat masuk,
            surat keluar, dan pengajuan surat
            organisasi KAMOO.
          </p>

        </div>


        <Link
          href="/surat/pengajuan"
          className="
            inline-flex
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
          "
        >
          <Plus size={18} />

          Ajukan Surat
        </Link>
      </section>


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <SummaryCard
          icon={
            <FolderOpen size={20} />
          }
          label="Total Riwayat"
          value={totalData}
        />


        <SummaryCard
          icon={
            <FileInput size={20} />
          }
          label="Surat Masuk"
          value={totalMasuk}
        />


        <SummaryCard
          icon={
            <FileOutput size={20} />
          }
          label="Surat Keluar"
          value={totalKeluar}
        />


        <SummaryCard
          icon={
            <FileText size={20} />
          }
          label="Pengajuan"
          value={totalPengajuan}
        />

      </section>


      {/* ==================================================
          DATA CARD
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

        {/* CARD HEADER */}

        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-6
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
            <FolderOpen size={20} />
          </div>


          <div>

            <h2
              className="
                font-bold
                text-slate-900
              "
            >
              Semua Riwayat
            </h2>


            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Data diurutkan dari aktivitas
              terbaru.
            </p>

          </div>

        </div>


        {/* ==================================================
            DESKTOP TABLE
        ================================================== */}

        <div
          className="
            hidden
            overflow-x-auto
            md:block
          "
        >
          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <TableHead>
                  Jenis
                </TableHead>


                <TableHead>
                  Nomor
                </TableHead>


                <TableHead>
                  Perihal
                </TableHead>


                <TableHead>
                  Status
                </TableHead>


                <TableHead>
                  Tanggal
                </TableHead>


                <TableHead align="right">
                  Aksi
                </TableHead>

              </tr>

            </thead>


            <tbody>

              {data.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      px-6
                      py-16
                      text-center
                    "
                  >

                    <div
                      className="
                        mx-auto
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-cyan-50
                        text-cyan-600
                      "
                    >
                      <FileText size={24} />
                    </div>


                    <h3
                      className="
                        mt-4
                        font-semibold
                        text-slate-900
                      "
                    >
                      Belum ada data surat
                    </h3>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Aktivitas persuratan akan
                      muncul di sini.
                    </p>

                  </td>

                </tr>

              ) : (

                data.map(
                  (item) => (

                    <tr
                      key={item.key}
                      className="
                        border-t
                        border-slate-100
                        transition
                        hover:bg-slate-50/70
                      "
                    >

                      {/* JENIS */}

                      <td
                        className="
                          px-5
                          py-4
                        "
                      >

                        <JenisBadge
                          jenis={
                            item.jenis
                          }
                        />

                      </td>


                      {/* NOMOR */}

                      <td
                        className="
                          max-w-[250px]
                          px-5
                          py-4
                        "
                      >

                        <p
                          className="
                            break-words
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                        >
                          {item.nomor}
                        </p>

                      </td>


                      {/* PERIHAL */}

                      <td
                        className="
                          max-w-[320px]
                          px-5
                          py-4
                        "
                      >

                        <p
                          className="
                            line-clamp-2
                            text-sm
                            font-medium
                            text-slate-700
                          "
                        >
                          {item.perihal}
                        </p>


                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-slate-400
                          "
                        >
                          {item.jenis ===
                          "Pengajuan"
                            ? `Pemohon: ${item.keterangan}`
                            : item.jenis ===
                                "Surat Masuk"
                              ? `Asal: ${item.keterangan}`
                              : `Tujuan: ${item.keterangan}`}
                        </p>

                      </td>


                      {/* STATUS */}

                      <td
                        className="
                          px-5
                          py-4
                        "
                      >

                        <StatusBadge
                          status={
                            item.status
                          }
                        />

                      </td>


                      {/* TANGGAL */}

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-sm
                          text-slate-500
                        "
                      >
                        {formatTanggal(
                          item.tanggal
                        )}
                      </td>


                      {/* AKSI */}

                      <td
                        className="
                          px-5
                          py-4
                        "
                      >

                        <div
                          className="
                            flex
                            justify-end
                          "
                        >

                          <Link
                            href={
                              item.link
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              px-3.5
                              py-2
                              text-xs
                              font-bold
                              text-slate-700
                              transition
                              hover:border-cyan-200
                              hover:bg-cyan-50
                              hover:text-cyan-700
                            "
                          >
                            Detail

                            <ArrowUpRight
                              size={14}
                            />
                          </Link>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>
        </div>


        {/* ==================================================
            MOBILE
        ================================================== */}

        <div
          className="
            divide-y
            divide-slate-100
            md:hidden
          "
        >

          {data.length === 0 ? (

            <div
              className="
                px-5
                py-14
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-50
                  text-cyan-600
                "
              >
                <FileText size={23} />
              </div>


              <p
                className="
                  mt-4
                  font-semibold
                  text-slate-800
                "
              >
                Belum ada data surat
              </p>

            </div>

          ) : (

            data.map(
              (item) => (

                <article
                  key={item.key}
                  className="p-5"
                >

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >

                    <JenisBadge
                      jenis={
                        item.jenis
                      }
                    />


                    <StatusBadge
                      status={
                        item.status
                      }
                    />

                  </div>


                  <div
                    className="
                      mt-4
                      space-y-4
                    "
                  >

                    <MobileInfo
                      label="Nomor"
                      value={
                        item.nomor
                      }
                    />


                    <MobileInfo
                      label="Perihal"
                      value={
                        item.perihal
                      }
                    />


                    <MobileInfo
                      label={
                        item.jenis ===
                        "Pengajuan"
                          ? "Pemohon"
                          : item.jenis ===
                              "Surat Masuk"
                            ? "Asal"
                            : "Tujuan"
                      }
                      value={
                        item.keterangan
                      }
                    />


                    <MobileInfo
                      label="Tanggal"
                      value={formatTanggal(
                        item.tanggal
                      )}
                    />

                  </div>


                  <Link
                    href={
                      item.link
                    }
                    className="
                      mt-5
                      inline-flex
                      w-full
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

                </article>

              )
            )

          )}

        </div>

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
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-cyan-50
          text-cyan-600
        "
      >
        {icon}
      </div>


      <p
        className="
          mt-4
          text-sm
          text-slate-500
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1
          text-3xl
          font-extrabold
          tracking-tight
          text-slate-900
        "
      >
        {value}
      </p>

    </div>
  );
}


// ======================================================
// JENIS BADGE
// ======================================================

function JenisBadge({
  jenis,
}: {
  jenis: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    "Surat Masuk":
      "border-blue-200 bg-blue-50 text-blue-700",

    "Surat Keluar":
      "border-cyan-200 bg-cyan-50 text-cyan-700",

    Pengajuan:
      "border-violet-200 bg-violet-50 text-violet-700",
  };


  return (
    <span
      className={`
        inline-flex
        whitespace-nowrap
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-bold
        ${
          styles[jenis] ??
          "border-slate-200 bg-slate-50 text-slate-600"
        }
      `}
    >
      {jenis}
    </span>
  );
}


// ======================================================
// TABLE HEAD
// ======================================================

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`
        px-5
        py-4
        text-xs
        font-bold
        uppercase
        tracking-wide
        text-slate-400
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
}


// ======================================================
// MOBILE INFO
// ======================================================

function MobileInfo({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>

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
          font-medium
          leading-6
          text-slate-700
        "
      >
        {value}
      </p>

    </div>
  );
}