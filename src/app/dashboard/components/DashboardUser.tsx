import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FilePlus2,
  FileText,
  FolderOpen,
  MapPin,
  WalletCards,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { QUOTES } from "@/lib/quotes";


// ======================================================
// TYPES
// ======================================================

type UserDashboard = {
  id: string;
  nama: string;
  email: string;
  role: string;
};


// ======================================================
// WIB
// ======================================================

function getHourWIB() {
  const hour =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        hour12: false,
      }
    ).format(new Date());

  return Number(hour);
}


function getGreetingWIB() {
  const hour =
    getHourWIB();


  if (
    hour >= 5 &&
    hour < 11
  ) {
    return "Selamat pagi";
  }


  if (
    hour >= 11 &&
    hour < 15
  ) {
    return "Selamat siang";
  }


  if (
    hour >= 15 &&
    hour < 18
  ) {
    return "Selamat sore";
  }


  return "Selamat malam";
}


function getTanggalWIB() {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(new Date());
}


// ======================================================
// DAILY QUOTE
// Satu quote untuk satu tanggal WIB.
// Refresh / login ulang di hari yang sama tetap sama.
// ======================================================

function getDailyQuote() {
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
      new Date()
    );


  let hash = 0;


  for (
    let i = 0;
    i < dateKey.length;
    i++
  ) {
    hash =
      (
        hash * 31 +
        dateKey.charCodeAt(i)
      ) >>> 0;
  }


  return QUOTES[
    hash %
      QUOTES.length
  ];
}


// ======================================================
// DATE
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
      timeZone: "Asia/Jakarta",
    }
  );
}


function formatJam(
  value: Date
) {
  return value.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }
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
  const data: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    DRAFT: {
      label: "Draft",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    },

    DIAJUKAN: {
      label: "Menunggu Review",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    DIPROSES: {
      label: "Diproses",
      className:
        "border-cyan-200 bg-cyan-50 text-cyan-700",
    },

    DISETUJUI: {
      label: "Disetujui",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    DITOLAK: {
      label: "Ditolak",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },

    SELESAI: {
      label: "Selesai",
      className:
        "border-violet-200 bg-violet-50 text-violet-700",
    },
  };


  const current =
    data[status] ??
    data.DRAFT;


  return (
    <span
      className={`
        inline-flex
        items-center
        whitespace-nowrap
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-bold
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}


// ======================================================
// DASHBOARD
// ======================================================

export default async function DashboardUser({
  user,
}: {
  user: UserDashboard;
}) {
  const [
    totalPengajuan,
    sedangDiproses,
    suratSelesai,
    reimburseSaya,
    pengajuanTerbaru,
    jadwalTerbaru,
  ] = await Promise.all([
    // TOTAL SURAT SAYA
    prisma.pengajuanSurat.count({
      where: {
        userId: user.id,
      },
    }),


    // MASIH BERJALAN
    prisma.pengajuanSurat.count({
      where: {
        userId: user.id,

        status: {
          in: [
            "DIAJUKAN",
            "DIPROSES",
            "DISETUJUI",
          ],
        },
      },
    }),


    // SELESAI
    prisma.pengajuanSurat.count({
      where: {
        userId: user.id,
        status: "SELESAI",
      },
    }),


    // REIMBURSE SAYA
    prisma.reimburse.count({
      where: {
        userId: user.id,
      },
    }),


    // PENGAJUAN TERBARU
    prisma.pengajuanSurat.findMany({
      where: {
        userId: user.id,
      },

      include: {
        suratKeluar: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 4,
    }),


    // AGENDA MENDATANG
    prisma.jadwal.findMany({
      where: {
        mulai: {
          gte: new Date(),
        },
      },

      orderBy: {
        mulai: "asc",
      },

      take: 4,
    }),
  ]);


  // ====================================================
  // GREETING
  // ====================================================

  const greeting =
    getGreetingWIB();


  const tanggal =
    getTanggalWIB();


  // ====================================================
  // DAILY QUOTE
  // ====================================================

  const quote =
    getDailyQuote();


  const roleLabel =
    user.role === "PENGURUS"
      ? "Pengurus"
      : "Anggota";


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
            {roleLabel}
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
          POSITIVE QUOTES
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
              pointer-events-none
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
          ACCOUNT SUMMARY HERO
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
            pointer-events-none
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
            pointer-events-none
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
                <Clock3
                  size={17}
                />

                Pengajuan Aktif
              </div>


              <p
                className="
                  mt-3
                  text-4xl
                  font-extrabold
                  tracking-tight
                  sm:text-5xl
                "
              >
                {sedangDiproses}
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
                Pengajuan surat yang masih berada
                dalam proses administrasi KAMOO.
              </p>
            </div>


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
                Surat Selesai
              </p>


              <p
                className="
                  mt-2
                  text-3xl
                  font-extrabold
                  text-emerald-200
                "
              >
                {suratSelesai}
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-white/55
                "
              >
                Administrasi surat yang sudah
                selesai diproses.
              </p>
            </div>
          </div>


          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-3
            "
          >
            <HeroMiniStat
              label="Total Pengajuan"
              value={totalPengajuan}
            />

            <HeroMiniStat
              label="Reimburse Saya"
              value={reimburseSaya}
            />

            <HeroMiniStat
              label="Agenda Mendatang"
              value={jadwalTerbaru.length}
            />
          </div>
        </div>
      </section>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <section>

        <SectionHeader
          title="Ringkasan Saya"
          subtitle="Status administrasi akun kamu saat ini"
        />


        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:gap-4
            xl:grid-cols-4
          "
        >

          <StatCard
            href="/surat/pengajuan"
            icon={
              <FileText size={20} />
            }
            label="Pengajuan Surat"
            value={totalPengajuan}
            helper="Total pengajuan"
            tone="cyan"
          />


          <StatCard
            href="/surat/pengajuan"
            icon={
              <Clock3 size={20} />
            }
            label="Sedang Diproses"
            value={sedangDiproses}
            helper="Butuh pemantauan"
            tone="amber"
          />


          <StatCard
            href="/surat/pengajuan"
            icon={
              <CheckCircle2 size={20} />
            }
            label="Surat Selesai"
            value={suratSelesai}
            helper="Administrasi selesai"
            tone="emerald"
          />


          <StatCard
            href="/keuangan/reimburse"
            icon={
              <WalletCards size={20} />
            }
            label="Reimburse"
            value={reimburseSaya}
            helper="Pengajuan biaya"
            tone="violet"
          />

        </div>

      </section>


      {/* ==================================================
          QUICK ACTION
      ================================================== */}

      <section>

        <SectionHeader
          title="Akses Cepat"
          subtitle="Menu yang paling sering digunakan"
        />


        <div
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <QuickAction
            href="/surat/pengajuan"
            icon={
              <FilePlus2 size={20} />
            }
            title="Pengajuan Surat"
            description="Ajukan atau pantau progres surat"
          />


          <QuickAction
            href="/keuangan/reimburse"
            icon={
              <WalletCards size={20} />
            }
            title="Reimburse"
            description="Ajukan penggantian biaya"
          />


          <QuickAction
            href="/jadwal"
            icon={
              <CalendarDays size={20} />
            }
            title="Jadwal Kegiatan"
            description="Cek agenda organisasi"
          />


          <QuickAction
            href="/loker"
            icon={
              <FolderOpen size={20} />
            }
            title="Loker"
            description="Akses ruang kerja dan berkas saya"
          />

        </div>

      </section>


      {/* ==================================================
          ACTIVITY + AGENDA
      ================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-2
        "
      >

        {/* RECENT SUBMISSION */}

        <div
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
                Pengajuan Terbaru
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Perkembangan surat milik kamu
              </p>

            </div>


            <Link
              href="/surat/pengajuan"
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-bold
                text-cyan-700
                transition
                hover:text-cyan-800
              "
            >
              Lihat semua

              <ArrowRight size={14} />
            </Link>

          </div>


          {pengajuanTerbaru.length ===
          0 ? (

            <EmptyState
              icon={
                <FileText size={21} />
              }
              title="Belum ada pengajuan"
              description="Pengajuan surat kamu akan muncul di sini."
            />

          ) : (

            <div
              className="
                divide-y
                divide-slate-100
              "
            >

              {pengajuanTerbaru.map(
                (item) => (

                  <Link
                    key={item.id}
                    href={`/surat/${item.id}`}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      px-5
                      py-4
                      transition
                      hover:bg-slate-50
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
                      <FileText size={18} />
                    </div>


                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
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
                          {item.jenis}
                        </p>


                        <StatusBadge
                          status={item.status}
                        />

                      </div>


                      <p
                        className="
                          mt-1
                          truncate
                          text-xs
                          text-slate-500
                        "
                      >
                        {item.tujuan}
                        {" • "}
                        {formatTanggal(
                          item.createdAt
                        )}
                      </p>


                      {item.suratKeluar && (

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            font-medium
                            text-emerald-600
                          "
                        >
                          {
                            item
                              .suratKeluar
                              .nomorSurat
                          }
                        </p>

                      )}

                    </div>


                    <ArrowUpRight
                      size={16}
                      className="
                        shrink-0
                        text-slate-300
                        transition
                        group-hover:text-cyan-600
                      "
                    />

                  </Link>

                )
              )}

            </div>

          )}

        </div>


        {/* UPCOMING AGENDA */}

        <div
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
                Agenda Mendatang
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Kegiatan organisasi berikutnya
              </p>

            </div>


            <Link
              href="/jadwal"
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-bold
                text-cyan-700
                transition
                hover:text-cyan-800
              "
            >
              Lihat semua

              <ArrowRight size={14} />
            </Link>

          </div>


          {jadwalTerbaru.length ===
          0 ? (

            <EmptyState
              icon={
                <CalendarDays
                  size={21}
                />
              }
              title="Belum ada agenda"
              description="Agenda mendatang akan muncul di sini."
            />

          ) : (

            <div
              className="
                divide-y
                divide-slate-100
              "
            >

              {jadwalTerbaru.map(
                (item) => (

                  <Link
                    key={item.id}
                    href={`/jadwal/${item.id}`}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      px-5
                      py-4
                      transition
                      hover:bg-slate-50
                      sm:px-6
                    "
                  >

                    {/* DATE BOX */}

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-50
                        text-cyan-700
                      "
                    >

                      <span
                        className="
                          text-base
                          font-extrabold
                          leading-none
                        "
                      >
                        {item.mulai
                          .getDate()
                          .toString()
                          .padStart(
                            2,
                            "0"
                          )}
                      </span>


                      <span
                        className="
                          mt-1
                          text-[9px]
                          font-bold
                          uppercase
                        "
                      >
                        {item.mulai
                          .toLocaleDateString(
                            "id-ID",
                            {
                              month:
                                "short",
                              timeZone:
                                "Asia/Jakarta",
                            }
                          )}
                      </span>

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
                        {item.judul}
                      </p>


                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
                        {formatJam(
                          item.mulai
                        )} WIB
                      </p>


                      {item.lokasi && (

                        <div
                          className="
                            mt-1.5
                            flex
                            items-center
                            gap-1
                            text-xs
                            text-slate-400
                          "
                        >
                          <MapPin size={12} />

                          <span
                            className="
                              truncate
                            "
                          >
                            {item.lokasi}
                          </span>
                        </div>

                      )}

                    </div>


                    <ArrowUpRight
                      size={16}
                      className="
                        shrink-0
                        text-slate-300
                        transition
                        group-hover:text-cyan-600
                      "
                    />

                  </Link>

                )
              )}

            </div>

          )}

        </div>

      </section>

    </div>
  );
}


// ======================================================
// HERO MINI STAT
// ======================================================

function HeroMiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-white/15
        bg-white/10
        px-4
        py-3
      "
    >
      <span
        className="
          text-sm
          text-white/75
        "
      >
        {label}
      </span>


      <span
        className="
          text-lg
          font-extrabold
          text-white
        "
      >
        {value}
      </span>
    </div>
  );
}


// ======================================================
// SECTION HEADER
// ======================================================

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">

      <h2
        className="
          text-lg
          font-bold
          text-slate-900
          sm:text-xl
        "
      >
        {title}
      </h2>


      <p
        className="
          mt-1
          text-sm
          text-slate-500
        "
      >
        {subtitle}
      </p>

    </div>
  );
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
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
  value: number;
  helper: string;
  tone:
    | "cyan"
    | "amber"
    | "emerald"
    | "violet";
}) {
  const tones = {
    cyan: {
      icon:
        "bg-cyan-50 text-cyan-600",
      value:
        "text-cyan-700",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
    },

    emerald: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-emerald-700",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-600",
      value:
        "text-violet-700",
    },
  };


  const style =
    tones[tone];


  return (
    <Link
      href={href}
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        hover:-translate-y-0.5
        hover:border-cyan-200
        hover:shadow-lg
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
            items-center
            justify-center
            rounded-xl
            ${style.icon}
          `}
        >
          {icon}
        </div>


        <ArrowUpRight
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
          text-2xl
          font-extrabold
          tracking-tight
          sm:text-3xl
          ${style.value}
        `}
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-[11px]
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
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        hover:-translate-y-0.5
        hover:border-cyan-200
        hover:shadow-lg
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
          bg-cyan-50
          text-cyan-600
          transition
          group-hover:bg-cyan-600
          group-hover:text-white
        "
      >
        {icon}
      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
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
            line-clamp-1
            text-xs
            text-slate-500
          "
        >
          {description}
        </p>
      </div>


      <ArrowRight
        size={16}
        className="
          shrink-0
          text-slate-300
          transition
          group-hover:translate-x-0.5
          group-hover:text-cyan-600
        "
      />

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
        min-h-[220px]
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