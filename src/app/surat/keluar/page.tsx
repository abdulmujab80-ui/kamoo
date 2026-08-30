import Link from "next/link";

import {
  FileText,
  FolderOpen,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Paperclip,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireSekretaris } from "@/lib/permissions";


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


export default async function SuratKeluarPage() {
  await requireSekretaris();


  const surat =
    await prisma.suratKeluar.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        pengajuan: {
          include: {
            user: true,
          },
        },
      },
    });


  const total = surat.length;


  const totalDokumen =
    surat.filter(
      (item) => Boolean(item.fileUrl)
    ).length;


  const totalSelesai =
    surat.filter(
      (item) =>
        item.status === "SELESAI"
    ).length;


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
            Surat Keluar
          </h1>


          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              text-slate-500
            "
          >
            Arsip dan pengelolaan surat resmi
            yang diterbitkan organisasi KAMOO.
          </p>

        </div>


        <Link
          href="/surat/keluar/tambah"
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

          Buat Surat
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
          xl:grid-cols-3
        "
      >

        <SummaryCard
          icon={
            <FileText size={20} />
          }
          label="Total Surat Keluar"
          value={String(total)}
        />


        <SummaryCard
          icon={
            <Paperclip size={20} />
          }
          label="Dokumen Terlampir"
          value={String(totalDokumen)}
        />


        <SummaryCard
          icon={
            <CheckCircle2 size={20} />
          }
          label="Surat Selesai"
          value={String(totalSelesai)}
        />

      </section>


      {/* ==================================================
          LIST
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

        {/* LIST HEADER */}

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
              Daftar Surat Keluar
            </h2>


            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Seluruh surat yang telah
              diterbitkan dan tercatat.
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
                  Nomor Surat
                </TableHead>

                <TableHead>
                  Tujuan
                </TableHead>

                <TableHead>
                  Perihal
                </TableHead>

                <TableHead>
                  Tanggal
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead align="right">
                  Aksi
                </TableHead>

              </tr>

            </thead>


            <tbody>

              {surat.length === 0 ? (

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
                      Belum ada surat keluar
                    </h3>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Surat yang diterbitkan akan
                      muncul di sini.
                    </p>

                  </td>

                </tr>

              ) : (

                surat.map((item) => (

                  <tr
                    key={item.id}
                    className="
                      border-t
                      border-slate-100
                      transition
                      hover:bg-slate-50/70
                    "
                  >

                    {/* NOMOR */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >

                      <p
                        className="
                          max-w-[260px]
                          break-words
                          text-sm
                          font-bold
                          text-slate-900
                        "
                      >
                        {item.nomorSurat}
                      </p>


                      {item.kodeJenis && (

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          {item.kodeJenis}

                          {item.kodeNomor
                            ? ` • ${item.kodeNomor}`
                            : ""}
                        </p>

                      )}

                    </td>


                    {/* TUJUAN */}

                    <td
                      className="
                        max-w-[220px]
                        px-5
                        py-4
                        text-sm
                        text-slate-600
                      "
                    >
                      {item.tujuan}
                    </td>


                    {/* PERIHAL */}

                    <td
                      className="
                        max-w-[280px]
                        px-5
                        py-4
                      "
                    >
                      <p
                        className="
                          line-clamp-2
                          text-sm
                          text-slate-600
                        "
                      >
                        {item.perihal}
                      </p>


                      {item.pengajuan && (

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          Pemohon:{" "}
                          {
                            item
                              .pengajuan
                              .user.nama
                          }
                        </p>

                      )}

                    </td>


                    {/* DATE */}

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
                        item.tanggalSurat
                      )}
                    </td>


                    {/* STATUS */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >
                      <StatusBadge
                        status={item.status}
                      />
                    </td>


                    {/* ACTION */}

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
                          href={`/surat/keluar/${item.id}`}
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

                ))

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

          {surat.length === 0 ? (

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
                Belum ada surat keluar
              </p>

            </div>

          ) : (

            surat.map((item) => (

              <article
                key={item.id}
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

                  <div className="min-w-0">

                    <p
                      className="
                        break-words
                        text-sm
                        font-bold
                        leading-6
                        text-slate-900
                      "
                    >
                      {item.nomorSurat}
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      {formatTanggal(
                        item.tanggalSurat
                      )}
                    </p>

                  </div>


                  <StatusBadge
                    status={item.status}
                  />

                </div>


                <div
                  className="
                    mt-5
                    space-y-4
                  "
                >

                  <MobileInfo
                    label="Tujuan"
                    value={item.tujuan}
                  />


                  <MobileInfo
                    label="Perihal"
                    value={item.perihal}
                  />


                  {item.pengajuan && (

                    <MobileInfo
                      label="Pemohon"
                      value={
                        item
                          .pengajuan
                          .user.nama
                      }
                    />

                  )}

                </div>


                <Link
                  href={`/surat/keluar/${item.id}`}
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

            ))

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
  value: string;
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