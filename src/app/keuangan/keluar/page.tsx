import Link from "next/link";

import {
  ArrowUpRight,
  FileText,
  Plus,
  TrendingDown,
  WalletCards,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireBendahara } from "@/lib/permissions";


// ======================================================
// FORMAT RUPIAH
// ======================================================

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(value: Date) {
  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// PAGE
// ======================================================

export default async function UangKeluarPage() {
  await requireBendahara();


  const transaksi =
    await prisma.keuangan.findMany({
      where: {
        jenis: "KELUAR",
      },

      orderBy: [
        {
          tanggal: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });


  const total =
    transaksi.reduce(
      (sum, item) =>
        sum + item.jumlah,
      0
    );


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        space-y-6
        sm:space-y-7
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <section
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >

        <div
          className="
            min-w-0
          "
        >

          <p
            className="
              text-sm
              font-bold
              text-rose-600
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
            Uang Keluar
          </h1>


          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-slate-500
              sm:text-base
            "
          >
            Catatan seluruh pengeluaran organisasi.
          </p>

        </div>


        <Link
          href="/keuangan/transaksi/tambah"
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-rose-600
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-rose-700
            sm:w-auto
          "
        >

          <Plus
            size={18}
          />

          Tambah Uang Keluar

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
        "
      >

        <SummaryCard
          icon={
            <TrendingDown
              size={20}
            />
          }
          label="Total Uang Keluar"
          value={
            formatRupiah(
              total
            )
          }
        />


        <SummaryCard
          icon={
            <FileText
              size={20}
            />
          }
          label="Jumlah Transaksi"
          value={
            `${transaksi.length} transaksi`
          }
        />

      </section>


      {/* ==================================================
          HISTORY
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

          <div
            className="
              min-w-0
            "
          >

            <h2
              className="
                text-base
                font-bold
                text-slate-900
                sm:text-lg
              "
            >
              Riwayat Uang Keluar
            </h2>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500
                sm:text-sm
              "
            >
              Seluruh pengeluaran yang tercatat
              dalam sistem.
            </p>

          </div>


          <div
            className="
              hidden
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-rose-50
              text-rose-600
              sm:flex
            "
          >
            <WalletCards
              size={19}
            />
          </div>

        </div>


        {transaksi.length === 0 ? (

          <EmptyState />

        ) : (

          <>

            {/* ==================================================
                DESKTOP
            ================================================== */}

            <div
              className="
                hidden
                md:block
              "
            >

              <div
                className="
                  grid
                  grid-cols-[130px_180px_minmax(240px,1fr)_180px_180px_90px]
                  items-center
                  gap-4
                  border-b
                  border-slate-100
                  bg-slate-50
                  px-6
                  py-3
                "
              >

                <HeaderCell>
                  Tanggal
                </HeaderCell>

                <HeaderCell>
                  Kategori
                </HeaderCell>

                <HeaderCell>
                  Keterangan
                </HeaderCell>

                <HeaderCell>
                  Pihak
                </HeaderCell>

                <HeaderCell align="right">
                  Jumlah
                </HeaderCell>

                <HeaderCell align="right">
                  Aksi
                </HeaderCell>

              </div>


              <div>

                {transaksi.map(
                  (item) => (

                    <div
                      key={
                        item.id
                      }
                      className="
                        grid
                        grid-cols-[130px_180px_minmax(240px,1fr)_180px_180px_90px]
                        items-center
                        gap-4
                        border-b
                        border-slate-100
                        px-6
                        py-4
                        transition
                        last:border-b-0
                        hover:bg-slate-50
                      "
                    >

                      {/* TANGGAL */}

                      <div
                        className="
                          text-sm
                          font-medium
                          text-slate-600
                        "
                      >
                        {formatTanggal(
                          item.tanggal
                        )}
                      </div>


                      {/* KATEGORI */}

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <span
                          className="
                            inline-flex
                            max-w-full
                            items-center
                            truncate
                            rounded-full
                            border
                            border-rose-200
                            bg-rose-50
                            px-3
                            py-1
                            text-xs
                            font-bold
                            text-rose-700
                          "
                        >
                          {item.kategori}
                        </span>

                      </div>


                      {/* KETERANGAN */}

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                          title={
                            item.keterangan
                          }
                        >
                          {
                            item.keterangan
                          }
                        </p>

                      </div>


                      {/* PIHAK */}

                      <div
                        className="
                          min-w-0
                          truncate
                          text-sm
                          text-slate-500
                        "
                      >
                        {item.pihak ??
                          "-"}
                      </div>


                      {/* JUMLAH */}

                      <div
                        className="
                          text-right
                        "
                      >

                        <p
                          className="
                            text-sm
                            font-extrabold
                            text-rose-700
                          "
                        >
                          -{" "}
                          {formatRupiah(
                            item.jumlah
                          )}
                        </p>

                      </div>


                      {/* AKSI */}

                      <div
                        className="
                          flex
                          justify-end
                        "
                      >

                        <Link
                          href={`/keuangan/transaksi/${item.id}`}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-1.5
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2
                            text-xs
                            font-bold
                            text-slate-700
                            transition
                            hover:border-rose-200
                            hover:bg-rose-50
                            hover:text-rose-700
                          "
                        >

                          Detail

                          <ArrowUpRight
                            size={14}
                          />

                        </Link>

                      </div>

                    </div>

                  )
                )}

              </div>

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

              {transaksi.map(
                (item) => (

                  <article
                    key={
                      item.id
                    }
                    className="
                      p-5
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
                        className="
                          inline-flex
                          max-w-[65%]
                          items-center
                          truncate
                          rounded-full
                          border
                          border-rose-200
                          bg-rose-50
                          px-3
                          py-1
                          text-[11px]
                          font-bold
                          text-rose-700
                        "
                      >
                        {item.kategori}
                      </span>


                      <span
                        className="
                          shrink-0
                          text-xs
                          font-medium
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
                        mt-4
                        text-sm
                        font-bold
                        leading-6
                        text-slate-800
                      "
                    >
                      {item.keterangan}
                    </p>


                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-slate-500
                      "
                    >

                      <span>
                        Pihak
                      </span>

                      <span>
                        •
                      </span>

                      <span
                        className="
                          truncate
                        "
                      >
                        {item.pihak ??
                          "Tidak dicantumkan"}
                      </span>

                    </div>


                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <p
                        className="
                          text-base
                          font-extrabold
                          text-rose-700
                        "
                      >
                        -{" "}
                        {formatRupiah(
                          item.jumlah
                        )}
                      </p>


                      <Link
                        href={`/keuangan/transaksi/${item.id}`}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3.5
                          py-2.5
                          text-xs
                          font-bold
                          text-slate-700
                          transition
                          hover:border-rose-200
                          hover:bg-rose-50
                          hover:text-rose-700
                        "
                      >
                        Detail
                        <ArrowUpRight
                          size={14}
                        />
                      </Link>

                    </div>

                  </article>

                )
              )}

            </div>

          </>

        )}

      </section>

    </div>
  );
}


// ======================================================
// HEADER CELL
// ======================================================

function HeaderCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`
        truncate
        text-[11px]
        font-bold
        uppercase
        tracking-wider
        text-slate-400

        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
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
        sm:p-6
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
          bg-rose-50
          text-rose-600
        "
      >
        {icon}
      </div>


      <p
        className="
          mt-4
          text-sm
          font-medium
          text-slate-500
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1
          break-words
          text-2xl
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
// EMPTY STATE
// ======================================================

function EmptyState() {
  return (
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
          bg-rose-50
          text-rose-600
        "
      >
        <WalletCards
          size={24}
        />
      </div>


      <h3
        className="
          mt-4
          text-sm
          font-bold
          text-slate-800
        "
      >
        Belum ada uang keluar
      </h3>


      <p
        className="
          mt-1
          max-w-sm
          text-sm
          leading-6
          text-slate-500
        "
      >
        Pengeluaran organisasi akan muncul
        di halaman ini setelah dicatat.
      </p>


      <Link
        href="/keuangan/transaksi/tambah"
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-rose-600
          px-4
          py-2.5
          text-xs
          font-bold
          text-white
          hover:bg-rose-700
        "
      >
        <Plus size={15} />
        Tambah Uang Keluar
      </Link>

    </div>
  );
}