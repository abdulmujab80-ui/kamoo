import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderOpen,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  prisma,
} from "@/lib/prisma";

import {
  QUOTES,
} from "@/lib/quotes";

import CardStat from "@/components/cardstat";
import QuickMenu from "@/components/quickmenu";
import Activity from "@/components/activity";


type UserDashboard = {
  id: string;
  nama: string;
  email: string;
  role: string;
};


// ======================================================
// GREETING WIB
// ======================================================

function getGreetingWIB() {
  const hour =
    Number(
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            "Asia/Jakarta",

          hour:
            "2-digit",

          hour12:
            false,
        }
      ).format(
        new Date()
      )
    );


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


// ======================================================
// TANGGAL WIB
// ======================================================

function getTanggalWIB() {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone:
        "Asia/Jakarta",

      weekday:
        "long",

      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",
    }
  ).format(
    new Date()
  );
}


// ======================================================
// DAILY QUOTE
// Tetap sama selama tanggal WIB yang sama.
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
// DASHBOARD SUPERADMIN
// ======================================================

export default async function DashboardSuperadmin({
  user,
}: {
  user: UserDashboard;
}) {
  const [
    totalUser,
    totalSurat,
    menungguApproval,
    totalReimburse,
    totalLoker,
    totalJadwal,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        aktif: true,
      },
    }),

    prisma.pengajuanSurat.count(),

    prisma.pengajuanSurat.count({
      where: {
        status:
          "DIAJUKAN",
      },
    }),

    prisma.reimburse.count(),

    prisma.loker.count(),

    prisma.jadwal.count(),
  ]);


  const greeting =
    getGreetingWIB();


  const tanggal =
    getTanggalWIB();


  const quote =
    getDailyQuote();


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
            Superadmin
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
              <ShieldCheck
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
          ORGANIZATION HERO
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
                <Users
                  size={17}
                />

                Pengguna Aktif
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
                {totalUser}
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
                Akun organisasi aktif yang
                terhubung dan dapat menggunakan
                layanan KAMOO.
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
                Menunggu Approval
              </p>


              <p
                className={`
                  mt-2
                  text-3xl
                  font-extrabold
                  ${
                    menungguApproval > 0
                      ? "text-amber-200"
                      : "text-emerald-200"
                  }
                `}
              >
                {menungguApproval}
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-white/55
                "
              >
                Pengajuan surat yang masih
                membutuhkan tindak lanjut.
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
            <HeroMetric
              icon={
                <FileText
                  size={16}
                />
              }
              label="Pengajuan Surat"
              value={
                totalSurat
              }
            />

            <HeroMetric
              icon={
                <CalendarDays
                  size={16}
                />
              }
              label="Agenda Kegiatan"
              value={
                totalJadwal
              }
            />

            <HeroMetric
              icon={
                <FolderOpen
                  size={16}
                />
              }
              label="Loker Pengguna"
              value={
                totalLoker
              }
            />
          </div>
        </div>
      </section>


      {/* ==================================================
          RINGKASAN ORGANISASI
      ================================================== */}

      <section>
        <div className="mb-4">
          <h2
            className="
              text-lg
              font-bold
              text-slate-900
              sm:text-xl
            "
          >
            Ringkasan Organisasi
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Informasi utama yang perlu dipantau.
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
          <CardStat
            title="Pengguna Aktif"
            value={
              totalUser
            }
            icon={
              <Users
                size={22}
              />
            }
            description="Akun aktif organisasi"
            color="cyan"
          />

          <CardStat
            title="Pengajuan Surat"
            value={
              totalSurat
            }
            icon={
              <FileText
                size={22}
              />
            }
            description="Total pengajuan administrasi"
            color="purple"
          />

          <CardStat
            title="Reimburse"
            value={
              totalReimburse
            }
            icon={
              <ReceiptText
                size={22}
              />
            }
            description="Total pengajuan biaya"
            color="orange"
          />

          <CardStat
            title="Loker"
            value={
              totalLoker
            }
            icon={
              <FolderOpen
                size={22}
              />
            }
            description="Ruang kerja pengguna"
            color="green"
          />
        </div>
      </section>


      {/* ==================================================
          AKSES CEPAT
      ================================================== */}

      <QuickMenu />


      {/* ==================================================
          RINGKASAN LANJUTAN
      ================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        "
      >
        <SummaryLink
          href="/approval"
          icon={
            <ClipboardCheck
              size={21}
            />
          }
          label="Approval Surat"
          value={
            menungguApproval
          }
          helper="Pengajuan menunggu tindak lanjut"
          tone="amber"
        />

        <SummaryLink
          href="/jadwal"
          icon={
            <CalendarDays
              size={21}
            />
          }
          label="Agenda Kegiatan"
          value={
            totalJadwal
          }
          helper="Total agenda organisasi"
          tone="cyan"
        />
      </section>


      <Activity />
    </div>
  );
}


// ======================================================
// HERO METRIC
// ======================================================

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string | number;
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
          text-lg
          font-extrabold
          text-white
        "
      >
        {value}
      </p>
    </div>
  );
}


// ======================================================
// SUMMARY LINK
// ======================================================

function SummaryLink({
  href,
  icon,
  label,
  value,
  helper,
  tone,
}: {
  href:
    string;

  icon:
    React.ReactNode;

  label:
    string;

  value:
    string | number;

  helper:
    string;

  tone:
    "amber" |
    "cyan";
}) {
  const styles = {
    amber:
      "bg-amber-50 text-amber-600",

    cyan:
      "bg-cyan-50 text-cyan-600",
  };


  return (
    <Link
      href={
        href
      }
      className="
        group
        flex
        items-center
        justify-between
        gap-4
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:border-cyan-200
        hover:shadow-lg
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-4
        "
      >
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            ${styles[tone]}
          `}
        >
          {icon}
        </div>


        <div className="min-w-0">
          <p
            className="
              text-sm
              text-slate-500
            "
          >
            {label}
          </p>

          <p
            className="
              text-2xl
              font-bold
              text-slate-900
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              truncate
              text-xs
              text-slate-400
            "
          >
            {helper}
          </p>
        </div>
      </div>


      <ArrowUpRight
        size={19}
        className="
          shrink-0
          text-slate-300
          transition
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-cyan-600
        "
      />
    </Link>
  );
}
