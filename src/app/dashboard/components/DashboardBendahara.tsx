import Link from "next/link";

import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { QUOTES } from "@/lib/quotes";


// ======================================================
// TYPE
// ======================================================

type UserDashboard = {
  id: string;
  nama: string;
  email: string;
  role: string;
};


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
// GREETING WIB
// ======================================================

function getGreetingWIB() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );

  if (hour >= 5 && hour < 11) {
    return "Selamat pagi";
  }

  if (hour >= 11 && hour < 15) {
    return "Selamat siang";
  }

  if (hour >= 15 && hour < 18) {
    return "Selamat sore";
  }

  return "Selamat malam";
}


// ======================================================
// TANGGAL WIB
// ======================================================

function getTanggalWIB() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}


// ======================================================
// QUOTE
// ======================================================
// Mengambil quote dari src/lib/quotes.ts.
// Quote berbeda berdasarkan user + tanggal.
// ======================================================

function getQuote(
  userId: string
) {
  let hash = 0;


  for (
    let i = 0;
    i < userId.length;
    i++
  ) {
    hash =
      (
        hash * 31 +
        userId.charCodeAt(i)
      ) %
      QUOTES.length;
  }


  const today =
    new Date();


  const dateKey =
    new Intl.DateTimeFormat(
      "en-CA",
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
    ).format(
      today
    );


  let dateHash = 0;


  for (
    let i = 0;
    i < dateKey.length;
    i++
  ) {
    dateHash =
      (
        dateHash * 31 +
        dateKey.charCodeAt(i)
      ) %
      QUOTES.length;
  }


  const index =
    (
      hash +
      dateHash
    ) %
    QUOTES.length;


  return QUOTES[
    index
  ];
}

// ======================================================
// DASHBOARD BENDAHARA
// ======================================================

export default async function DashboardBendahara({
  user,
}: {
  user: UserDashboard;
}) {
  const now = new Date();

  const awalBulan = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const awalBulanBerikutnya = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );


  // ====================================================
  // DATABASE
  // ====================================================

  const [
    totalMasuk,
    totalKeluar,
    masukBulanIni,
    keluarBulanIni,
    reimbursePending,
    reimburseTotal,
    transaksiTerbaru,
    reimburseTerbaru,
  ] = await Promise.all([

    prisma.keuangan.aggregate({
      where: {
        jenis: "MASUK",
      },
      _sum: {
        jumlah: true,
      },
    }),

    prisma.keuangan.aggregate({
      where: {
        jenis: "KELUAR",
      },
      _sum: {
        jumlah: true,
      },
    }),

    prisma.keuangan.aggregate({
      where: {
        jenis: "MASUK",
        tanggal: {
          gte: awalBulan,
          lt: awalBulanBerikutnya,
        },
      },
      _sum: {
        jumlah: true,
      },
    }),

    prisma.keuangan.aggregate({
      where: {
        jenis: "KELUAR",
        tanggal: {
          gte: awalBulan,
          lt: awalBulanBerikutnya,
        },
      },
      _sum: {
        jumlah: true,
      },
    }),

    prisma.reimburse.count({
      where: {
        status: "MENUNGGU",
      },
    }),

    prisma.reimburse.count(),

    prisma.keuangan.findMany({
      orderBy: [
        {
          tanggal: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 5,
    }),

    prisma.reimburse.findMany({
      where: {
        status: {
          in: [
            "MENUNGGU",
            "DISETUJUI",
          ],
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    }),

  ]);


  // ====================================================
  // NILAI
  // ====================================================

  const pemasukan =
    totalMasuk._sum.jumlah ?? 0;

  const pengeluaran =
    totalKeluar._sum.jumlah ?? 0;

  const saldo =
    pemasukan - pengeluaran;

  const pemasukanBulanIni =
    masukBulanIni._sum.jumlah ?? 0;

  const pengeluaranBulanIni =
    keluarBulanIni._sum.jumlah ?? 0;

  const netBulanIni =
    pemasukanBulanIni -
    pengeluaranBulanIni;


  const greeting =
    getGreetingWIB();

  const tanggal =
    getTanggalWIB();

  const quote =
    getQuote(user.id);


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
          gap-3
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >

        <div className="min-w-0">

          <p
            className="
              text-sm
              font-bold
              text-cyan-600
            "
          >
            Admin Bendahara
          </p>


          <h1
            className="
              mt-1
              text-2xl
              font-extrabold
              tracking-tight
              text-slate-900
              sm:text-3xl
              lg:text-[34px]
            "
          >
            {greeting}, {user.nama}
          </h1>

        </div>


        <div
          className="
            inline-flex
            w-fit
            shrink-0
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-3
            py-2
            text-xs
            font-semibold
            text-slate-500
            shadow-sm
          "
        >

          <CalendarDays
            size={14}
            className="
              text-cyan-600
            "
          />

          <span>
            {tanggal}
          </span>

        </div>

      </section>


      {/* ==================================================
          QUOTE
      ================================================== */}

      <section
        className="
          overflow-hidden
          rounded-[28px]
          border
          border-cyan-100
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            relative
            px-5
            py-6
            sm:px-7
            sm:py-7
            lg:px-8
          "
        >

          <div
            className="
              absolute
              -right-10
              -top-10
              h-32
              w-32
              rounded-full
              bg-cyan-50
            "
          />


          <div
            className="
              relative
              flex
              items-start
              gap-4
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
                rounded-2xl
                bg-cyan-50
                text-cyan-600
              "
            >
              <WalletCards
                size={20}
              />
            </div>


            <div
              className="
                min-w-0
                max-w-4xl
              "
            >

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-cyan-600
                  sm:text-xs
                "
              >
                Positive Quotes
              </p>


              <p
                className="
                  mt-2
                  text-base
                  font-semibold
                  leading-7
                  text-slate-800
                  sm:text-lg
                  sm:leading-8
                "
              >
                “{quote}”
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          BALANCE HERO
      ================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          bg-gradient-to-br
          from-teal-600
          via-cyan-600
          to-cyan-500
          text-white
          shadow-xl
          shadow-cyan-100
        "
      >

        <div
          className="
            absolute
            -right-20
            -top-20
            h-64
            w-64
            rounded-full
            bg-white/10
          "
        />


        <div
          className="
            absolute
            -bottom-24
            right-1/3
            h-48
            w-48
            rounded-full
            bg-white/5
          "
        />


        <div
          className="
            relative
            p-5
            sm:p-7
            lg:p-8
          "
        >

          <div
            className="
              grid
              grid-cols-1
              gap-6
              lg:grid-cols-[1.2fr_0.8fr]
              lg:items-end
            "
          >

            {/* SALDO */}

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-white/75
                "
              >

                <WalletCards
                  size={17}
                />

                Saldo Organisasi

              </div>


              <p
                className="
                  mt-3
                  break-words
                  text-3xl
                  font-extrabold
                  tracking-tight
                  sm:text-4xl
                  lg:text-[42px]
                "
              >
                {formatRupiah(
                  saldo
                )}
              </p>


              <p
                className="
                  mt-2
                  max-w-xl
                  text-xs
                  leading-6
                  text-white/65
                  sm:text-sm
                "
              >
                Saldo berdasarkan seluruh pemasukan
                dan pengeluaran yang tercatat.
              </p>

            </div>


            {/* NET */}

            <div
              className="
                rounded-2xl
                border
                border-white/15
                bg-white/10
                p-5
                backdrop-blur-sm
              "
            >

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-white/55
                "
              >
                Arus Kas Bulan Ini
              </p>


              <p
                className={`
                  mt-2
                  break-words
                  text-2xl
                  font-extrabold
                  sm:text-3xl
                  ${
                    netBulanIni >= 0
                      ? "text-emerald-200"
                      : "text-rose-200"
                  }
                `}
              >
                {netBulanIni >= 0
                  ? "+"
                  : ""}
                {formatRupiah(
                  netBulanIni
                )}
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-white/55
                "
              >
                Pemasukan bulan ini dikurangi
                pengeluaran bulan ini.
              </p>

            </div>

          </div>


          {/* MONTHLY FLOW */}

          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
            "
          >

            <FlowCard
              icon={
                <ArrowDownLeft
                  size={16}
                />
              }
              label="Kas Masuk Bulan Ini"
              value={
                formatRupiah(
                  pemasukanBulanIni
                )
              }
            />


            <FlowCard
              icon={
                <ArrowUpRight
                  size={16}
                />
              }
              label="Kas Keluar Bulan Ini"
              value={
                formatRupiah(
                  pengeluaranBulanIni
                )
              }
            />

          </div>

        </div>

      </section>


      {/* ==================================================
          RINGKASAN
      ================================================== */}

      <section>

        <div
          className="
            mb-4
          "
        >

          <h2
            className="
              text-lg
              font-bold
              text-slate-900
              sm:text-xl
            "
          >
            Ringkasan Keuangan
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Informasi penting yang perlu dipantau.
          </p>

        </div>


        <div
          className="
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >

          <KpiCard
            href="/keuangan/masuk"
            icon={
              <ArrowDownLeft
                size={20}
              />
            }
            label="Kas Masuk"
            value={
              formatRupiah(
                pemasukan
              )
            }
            helper="Total pemasukan"
            tone="green"
          />


          <KpiCard
            href="/keuangan/keluar"
            icon={
              <ArrowUpRight
                size={20}
              />
            }
            label="Kas Keluar"
            value={
              formatRupiah(
                pengeluaran
              )
            }
            helper="Total pengeluaran"
            tone="rose"
          />


          <KpiCard
            href="/keuangan/reimburse"
            icon={
              <ReceiptText
                size={20}
              />
            }
            label="Reimburse Pending"
            value={
              reimbursePending
            }
            helper={
              `${reimburseTotal} total pengajuan`
            }
            tone="amber"
          />


          <KpiCard
            href="/keuangan/laporan"
            icon={
              <TrendingUp
                size={20}
              />
            }
            label="Net Bulan Ini"
            value={
              formatRupiah(
                netBulanIni
              )
            }
            helper="Masuk - keluar"
            tone="cyan"
          />

        </div>

      </section>


      {/* ==================================================
          AKSES CEPAT
      ================================================== */}

      <section>

        <div
          className="
            mb-4
          "
        >

          <h2
            className="
              text-lg
              font-bold
              text-slate-900
              sm:text-xl
            "
          >
            Akses Cepat
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Akses pekerjaan bendahara yang paling sering digunakan.
          </p>

        </div>


        <div
          className="
            grid
            grid-cols-2
            gap-3
            xl:grid-cols-4
          "
        >

          <QuickAction
            href="/keuangan/masuk"
            icon={
              <ArrowDownLeft
                size={19}
              />
            }
            title="Uang Masuk"
            description="Catat pemasukan organisasi"
          />


          <QuickAction
            href="/keuangan/keluar"
            icon={
              <ArrowUpRight
                size={19}
              />
            }
            title="Uang Keluar"
            description="Catat pengeluaran organisasi"
          />


          <QuickAction
            href="/keuangan/reimburse"
            icon={
              <ClipboardCheck
                size={19}
              />
            }
            title="Approval"
            description={
              reimbursePending > 0
                ? `${reimbursePending} pengajuan menunggu`
                : "Tidak ada pengajuan menunggu"
            }
            highlight={
              reimbursePending > 0
            }
          />


          <QuickAction
            href="/keuangan/laporan"
            icon={
              <FileSpreadsheet
                size={19}
              />
            }
            title="Laporan Keuangan"
            description="Rekap dan export data"
          />

        </div>

      </section>


      {/* ==================================================
          TRANSAKSI + REIMBURSE
      ================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-[1.15fr_0.85fr]
        "
      >

        {/* TRANSAKSI */}

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
                Transaksi Terbaru
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Lima transaksi terakhir.
              </p>

            </div>


            <div className="flex gap-2">

              <Link
                href="/keuangan/masuk"
                className="
                  hidden
                  text-xs
                  font-bold
                  text-cyan-700
                  sm:block
                "
              >
                Lihat semua
              </Link>

            </div>

          </div>


          {transaksiTerbaru.length === 0 ? (

            <EmptyState
              icon={
                <WalletCards
                  size={22}
                />
              }
              title="Belum ada transaksi"
              description="Transaksi keuangan akan muncul di sini."
            />

          ) : (

            <div
              className="
                divide-y
                divide-slate-100
              "
            >

              {transaksiTerbaru.map(
                (item) => {

                  const isMasuk =
                    item.jenis ===
                    "MASUK";


                  return (
                    <Link
                      key={item.id}
                      href={`/keuangan/transaksi/${item.id}`}
                      className="
                        group
                        flex
                        min-w-0
                        items-center
                        gap-3
                        px-5
                        py-4
                        transition
                        hover:bg-slate-50
                        sm:gap-4
                        sm:px-6
                      "
                    >

                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${
                            isMasuk
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }
                        `}
                      >

                        {isMasuk ? (
                          <ArrowDownLeft
                            size={18}
                          />
                        ) : (
                          <ArrowUpRight
                            size={18}
                          />
                        )}

                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-800
                          "
                        >
                          {item.keterangan}
                        </p>


                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-slate-400
                          "
                        >
                          {item.kategori}
                          {" • "}
                          {formatTanggal(
                            item.tanggal
                          )}
                        </p>

                      </div>


                      <div
                        className="
                          shrink-0
                          text-right
                        "
                      >

                        <p
                          className={`
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
                        </p>

                      </div>


                      <ArrowRight
                        size={15}
                        className="
                          hidden
                          shrink-0
                          text-slate-300
                          transition
                          group-hover:text-cyan-600
                          sm:block
                        "
                      />

                    </Link>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* REIMBURSE */}

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
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Reimburse Perlu Aksi
                </h2>


                {reimbursePending > 0 && (

                  <span
                    className="
                      rounded-full
                      bg-amber-100
                      px-2
                      py-0.5
                      text-[10px]
                      font-bold
                      text-amber-700
                    "
                  >
                    {reimbursePending}
                  </span>

                )}

              </div>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Pengajuan yang perlu dipantau.
              </p>

            </div>


            <Link
              href="/keuangan/reimburse"
              className="
                text-xs
                font-bold
                text-cyan-700
              "
            >
              Semua
            </Link>

          </div>


          {reimburseTerbaru.length === 0 ? (

            <EmptyState
              icon={
                <CheckCircle2
                  size={22}
                />
              }
              title="Tidak ada yang perlu ditindak"
              description="Semua reimburse dalam kondisi aman."
            />

          ) : (

            <div
              className="
                divide-y
                divide-slate-100
              "
            >

              {reimburseTerbaru.map(
                (item) => (

                  <Link
                    key={item.id}
                    href={`/keuangan/reimburse/${item.id}`}
                    className="
                      group
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

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-800
                          "
                        >
                          {item.user.nama}
                        </p>


                        <p
                          className="
                            mt-1
                            line-clamp-2
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >
                          {item.keterangan}
                        </p>

                      </div>


                      <ArrowRight
                        size={15}
                        className="
                          shrink-0
                          text-slate-300
                          transition
                          group-hover:text-cyan-600
                        "
                      />

                    </div>


                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-extrabold
                          text-slate-900
                        "
                      >
                        {formatRupiah(
                          item.jumlah
                        )}
                      </p>


                      <span
                        className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          ${
                            item.status ===
                            "MENUNGGU"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-cyan-50 text-cyan-700"
                          }
                        `}
                      >
                        {item.status ===
                        "MENUNGGU"
                          ? "Menunggu"
                          : "Siap Dibayar"}
                      </span>

                    </div>

                  </Link>
                )
              )}

            </div>

          )}

        </section>

      </section>

    </div>
  );
}


// ======================================================
// FLOW CARD
// ======================================================

function FlowCard({
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
        rounded-2xl
        border
        border-white/10
        bg-white/10
        p-4
        backdrop-blur-sm
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          text-xs
          font-semibold
          text-white/65
        "
      >
        {icon}
        {label}
      </div>


      <p
        className="
          mt-2
          break-words
          text-base
          font-extrabold
          text-white
          sm:text-lg
        "
      >
        {value}
      </p>

    </div>
  );
}


// ======================================================
// KPI CARD
// ======================================================

function KpiCard({
  href,
  icon,
  label,
  value,
  helper,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
  tone:
    | "green"
    | "rose"
    | "amber"
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

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
    },

    cyan: {
      icon:
        "bg-cyan-50 text-cyan-600",
      value:
        "text-cyan-700",
    },
  };


  return (
    <Link
      href={href}
      className="
        group
        min-w-0
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-cyan-200
        hover:shadow-md
        sm:p-5
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-2
        "
      >

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${styles[tone].icon}
          `}
        >
          {icon}
        </div>


        <ArrowRight
          size={15}
          className="
            text-slate-300
            transition
            group-hover:text-cyan-600
          "
        />

      </div>


      <p
        className="
          mt-4
          truncate
          text-xs
          font-medium
          text-slate-500
          sm:text-sm
        "
      >
        {label}
      </p>


      <p
        className={`
          mt-1
          truncate
          text-lg
          font-extrabold
          tracking-tight
          sm:text-2xl
          ${styles[tone].value}
        `}
      >
        {value}
      </p>


      <p
        className="
          mt-1
          truncate
          text-[10px]
          text-slate-400
          sm:text-xs
        "
      >
        {helper}
      </p>

    </Link>
  );
}


// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
  href,
  icon,
  title,
  description,
  highlight = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group
        min-w-0
        rounded-2xl
        border
        bg-white
        p-4
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        sm:p-5

        ${
          highlight
            ? "border-amber-200 hover:border-amber-300"
            : "border-slate-200 hover:border-cyan-200"
        }
      `}
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${
              highlight
                ? "bg-amber-50 text-amber-600"
                : "bg-cyan-50 text-cyan-600"
            }
          `}
        >
          {icon}
        </div>


        <ArrowRight
          size={15}
          className="
            shrink-0
            text-slate-300
            transition
            group-hover:text-cyan-600
          "
        />

      </div>


      <p
        className="
          mt-4
          truncate
          text-sm
          font-bold
          text-slate-800
        "
      >
        {title}
      </p>


      <p
        className="
          mt-1
          line-clamp-2
          text-xs
          leading-5
          text-slate-500
        "
      >
        {description}
      </p>

    </Link>
  );
}


// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[210px]
        flex-col
        items-center
        justify-center
        px-6
        py-10
        text-center
      "
    >

      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-slate-100
          text-slate-500
        "
      >
        {icon}
      </div>


      <p
        className="
          mt-4
          text-sm
          font-bold
          text-slate-700
        "
      >
        {title}
      </p>


      <p
        className="
          mt-1
          max-w-xs
          text-xs
          leading-5
          text-slate-400
        "
      >
        {description}
      </p>

    </div>
  );
}