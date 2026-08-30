import Link from "next/link";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  FileSpreadsheet,
  WalletCards,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import {
  getSession,
} from "@/lib/auth";

import {
  redirect,
} from "next/navigation";


// ======================================================
// TYPES
// ======================================================

type SearchParams = {
  bulan?: string;
  tahun?: string;
};


// ======================================================
// FORMAT RUPIAH
// ======================================================

function formatRupiah(
  value: number
) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(
  value: Date
) {
  return value.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone:
        "Asia/Jakarta",
    }
  );
}


// ======================================================
// NAMA BULAN
// ======================================================

const namaBulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];


// ======================================================
// PAGE
// ======================================================

export default async function LaporanKeuanganPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  if (
    session.role !==
      "SUPERADMIN" &&
    session.role !==
      "ADMIN_BENDAHARA"
  ) {
    redirect("/dashboard");
  }


  const params =
    await searchParams;


  const now =
    new Date();


  const bulan =
    params.bulan
      ? Number(params.bulan)
      : now.getMonth() + 1;


  const tahun =
    params.tahun
      ? Number(params.tahun)
      : now.getFullYear();


  const bulanValid =
    Number.isInteger(bulan) &&
    bulan >= 1 &&
    bulan <= 12;


  const tahunValid =
    Number.isInteger(tahun) &&
    tahun >= 2000 &&
    tahun <= 2100;


  const bulanAktif =
    bulanValid
      ? bulan
      : now.getMonth() + 1;


  const tahunAktif =
    tahunValid
      ? tahun
      : now.getFullYear();


  // ====================================================
  // PERIODE
  // ====================================================

  const awalPeriode =
    new Date(
      tahunAktif,
      bulanAktif - 1,
      1
    );


  const akhirPeriode =
    new Date(
      tahunAktif,
      bulanAktif,
      1
    );


  // ====================================================
  // DATA
  // ====================================================

  const transaksi =
    await prisma.keuangan.findMany({
      where: {
        tanggal: {
          gte: awalPeriode,
          lt: akhirPeriode,
        },
      },

      orderBy: [
        {
          tanggal: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });


  // ====================================================
  // RINGKASAN
  // ====================================================

  const pemasukan =
    transaksi
      .filter(
        (item) =>
          item.jenis === "MASUK"
      )
      .reduce(
        (total, item) =>
          total + item.jumlah,
        0
      );


  const pengeluaran =
    transaksi
      .filter(
        (item) =>
          item.jenis === "KELUAR"
      )
      .reduce(
        (total, item) =>
          total + item.jumlah,
        0
      );


  const saldo =
    pemasukan -
    pengeluaran;


  return (
    <div
      className="
        mx-auto
        max-w-7xl
        space-y-7
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <section>

        <Link
          href="/dashboard"
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
          <ArrowLeftRight
            size={16}
          />

          Ke Dashboard
        </Link>


        <div
          className="
            mt-5
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

          <div>

            <p
              className="
                text-sm
                font-bold
                text-cyan-600
              "
            >
              Keuangan
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
              Laporan Keuangan
            </h1>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              Rekap pemasukan dan pengeluaran
              organisasi berdasarkan periode.
            </p>

          </div>


          <Link
            href={`/api/keuangan/laporan/export?bulan=${bulanAktif}&tahun=${tahunAktif}`}
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
            <Download
              size={17}
            />

            Export Excel
          </Link>

        </div>

      </section>


      {/* ==================================================
          FILTER
      ================================================== */}

      <section
        className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
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
            <CalendarDays
              size={19}
            />
          </div>


          <div>

            <h2
              className="
                font-bold
                text-slate-900
              "
            >
              Periode Laporan
            </h2>


            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Pilih bulan dan tahun yang ingin
              ditampilkan.
            </p>

          </div>

        </div>


        <form
          method="GET"
          className="
            mt-5
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-[1fr_180px_auto]
          "
        >

          {/* BULAN */}

          <div>

            <label
              htmlFor="bulan"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Bulan
            </label>


            <select
              id="bulan"
              name="bulan"
              defaultValue={
                String(
                  bulanAktif
                )
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
                transition
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            >

              {namaBulan.map(
                (
                  nama,
                  index
                ) => (
                  <option
                    key={nama}
                    value={
                      index + 1
                    }
                  >
                    {nama}
                  </option>
                )
              )}

            </select>

          </div>


          {/* TAHUN */}

          <div>

            <label
              htmlFor="tahun"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Tahun
            </label>


            <select
              id="tahun"
              name="tahun"
              defaultValue={
                String(
                  tahunAktif
                )
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
                transition
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            >

              {Array.from(
                {
                  length: 7,
                },
                (_, index) =>
                  tahunAktif -
                  3 +
                  index
              ).map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}

            </select>

          </div>


          {/* BUTTON */}

          <div
            className="
              flex
              items-end
            "
          >

            <button
              type="submit"
              className="
                w-full
                rounded-xl
                bg-cyan-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-cyan-700
                sm:w-auto
              "
            >
              Tampilkan
            </button>

          </div>

        </form>

      </section>


      {/* ==================================================
          REPORT TITLE
      ================================================== */}

      <section
        className="
          rounded-3xl
          border
          border-cyan-100
          bg-cyan-50
          px-5
          py-4
          sm:px-6
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
          Periode aktif
        </p>


        <p
          className="
            mt-1
            text-lg
            font-extrabold
            text-slate-900
          "
        >
          {namaBulan[
            bulanAktif - 1
          ]}{" "}
          {tahunAktif}
        </p>

      </section>


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
      >

        <SummaryCard
          icon={
            <ArrowDownLeft
              size={20}
            />
          }
          label="Total Pemasukan"
          value={
            formatRupiah(
              pemasukan
            )
          }
          tone="green"
        />


        <SummaryCard
          icon={
            <ArrowUpRight
              size={20}
            />
          }
          label="Total Pengeluaran"
          value={
            formatRupiah(
              pengeluaran
            )
          }
          tone="rose"
        />


        <SummaryCard
          icon={
            <WalletCards
              size={20}
            />
          }
          label="Saldo Periode"
          value={
            formatRupiah(
              saldo
            )
          }
          tone="cyan"
        />

      </section>


      {/* ==================================================
          TABLE
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
            flex
            items-center
            justify-between
            gap-4
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-6
          "
        >

          <div>

            <h2
              className="
                font-bold
                text-slate-900
              "
            >
              Detail Transaksi
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {transaksi.length} transaksi
              pada periode ini.
            </p>

          </div>


          <FileSpreadsheet
            size={20}
            className="
              text-emerald-600
            "
          />

        </div>


        {transaksi.length ===
        0 ? (

          <div
            className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-400
              "
            >
              <FileSpreadsheet
                size={25}
              />
            </div>


            <p
              className="
                mt-4
                text-sm
                font-bold
                text-slate-700
              "
            >
              Belum ada transaksi
            </p>


            <p
              className="
                mt-1
                text-sm
                text-slate-400
              "
            >
              Tidak ada transaksi pada periode
              yang dipilih.
            </p>

          </div>

        ) : (

          <>

            {/* DESKTOP */}

            <div
              className="
                hidden
                overflow-x-auto
                md:block
              "
            >

              <table className="w-full">

                <thead
                  className="
                    bg-slate-50
                  "
                >

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Jenis
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Kategori
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Keterangan
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pihak
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Jumlah
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {transaksi.map(
                    (
                      item
                    ) => {

                      const isMasuk =
                        item.jenis ===
                        "MASUK";


                      return (
                        <tr
                          key={
                            item.id
                          }
                          className="
                            border-t
                            border-slate-100
                            transition
                            hover:bg-slate-50
                          "
                        >

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatTanggal(
                              item.tanggal
                            )}
                          </td>


                          <td className="px-6 py-4">

                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-bold

                                ${
                                  isMasuk
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }
                              `}
                            >

                              {isMasuk ? (
                                <ArrowDownLeft
                                  size={13}
                                />
                              ) : (
                                <ArrowUpRight
                                  size={13}
                                />
                              )}

                              {isMasuk
                                ? "Masuk"
                                : "Keluar"}

                            </span>

                          </td>


                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {item.kategori}
                          </td>


                          <td className="max-w-[300px] px-6 py-4 text-sm text-slate-600">
                            {item.keterangan}
                          </td>


                          <td className="px-6 py-4 text-sm text-slate-500">
                            {item.pihak ??
                              "-"}
                          </td>


                          <td
                            className={`
                              px-6
                              py-4
                              text-right
                              text-sm
                              font-extrabold
                              ${
                                isMasuk
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                              }
                            `}
                          >
                            {isMasuk
                              ? "+"
                              : "-"}
                            {formatRupiah(
                              item.jumlah
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* MOBILE */}

            <div
              className="
                divide-y
                divide-slate-100
                md:hidden
              "
            >

              {transaksi.map(
                (
                  item
                ) => {

                  const isMasuk =
                    item.jenis ===
                    "MASUK";


                  return (
                    <Link
                      key={
                        item.id
                      }
                      href={`/keuangan/transaksi/${item.id}`}
                      className="
                        block
                        p-5
                        transition
                        hover:bg-slate-50
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-3
                            py-1
                            text-[11px]
                            font-bold

                            ${
                              isMasuk
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }
                          `}
                        >

                          {isMasuk ? (
                            <ArrowDownLeft
                              size={13}
                            />
                          ) : (
                            <ArrowUpRight
                              size={13}
                            />
                          )}

                          {isMasuk
                            ? "Masuk"
                            : "Keluar"}

                        </span>


                        <span
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          {formatTanggal(
                            item.tanggal
                          )}
                        </span>

                      </div>


                      <p
                        className="
                          mt-3
                          text-sm
                          font-bold
                          leading-6
                          text-slate-800
                        "
                      >
                        {item.keterangan}
                      </p>


                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
                        {item.kategori}
                        {item.pihak
                          ? ` • ${item.pihak}`
                          : ""}
                      </p>


                      <p
                        className={`
                          mt-3
                          text-base
                          font-extrabold
                          ${
                            isMasuk
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }
                        `}
                      >
                        {isMasuk
                          ? "+"
                          : "-"}
                        {formatRupiah(
                          item.jumlah
                        )}
                      </p>

                    </Link>
                  );
                }
              )}

            </div>

          </>

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
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone:
    | "green"
    | "rose"
    | "cyan";
}) {
  const styles = {
    green: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-emerald-700",
    },

    rose: {
      icon:
        "bg-rose-50 text-rose-600",
      value:
        "text-rose-700",
    },

    cyan: {
      icon:
        "bg-cyan-50 text-cyan-600",
      value:
        "text-cyan-700",
    },
  };


  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${styles[tone].icon}
        `}
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
        className={`
          mt-1
          text-xl
          font-extrabold
          tracking-tight
          ${styles[tone].value}
        `}
      >
        {value}
      </p>

    </div>
  );
}