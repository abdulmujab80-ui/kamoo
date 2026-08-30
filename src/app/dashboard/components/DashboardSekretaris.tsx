import Link from "next/link";

import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  FolderOpen,
  Inbox,
  Send,
} from "lucide-react";

import {
  prisma,
} from "@/lib/prisma";

import {
  QUOTES,
} from "@/lib/quotes";

import CardStat from "@/components/cardstat";
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
// DASHBOARD SEKRETARIS
// ======================================================

export default async function DashboardSekretaris({
  user,
}: {
  user: UserDashboard;
}) {
  const [
    totalSuratMasuk,
    totalSuratKeluar,
    menungguApproval,
    suratDiproses,
    suratSelesai,
  ] = await Promise.all([
    prisma.suratMasuk.count(),

    prisma.suratKeluar.count(),

    prisma.pengajuanSurat.count({
      where: {
        status:
          "DIAJUKAN",
      },
    }),

    prisma.suratKeluar.count({
      where: {
        status:
          "DIPROSES",
      },
    }),

    prisma.suratKeluar.count({
      where: {
        status:
          "SELESAI",
      },
    }),
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
            Admin Sekretaris
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
              <Inbox
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
          ADMINISTRATION HERO
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
                <ClipboardCheck
                  size={17}
                />

                Menunggu Review
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
                {menungguApproval}
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
                Pengajuan surat yang masih perlu
                diperiksa dan ditindaklanjuti oleh
                sekretariat.
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
                Surat Sedang Diproses
              </p>


              <p
                className="
                  mt-2
                  text-3xl
                  font-extrabold
                  text-cyan-100
                "
              >
                {suratDiproses}
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-white/55
                "
              >
                Surat keluar yang belum masuk
                status final.
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
                <Inbox
                  size={16}
                />
              }
              label="Surat Masuk"
              value={
                totalSuratMasuk
              }
            />

            <HeroMetric
              icon={
                <Send
                  size={16}
                />
              }
              label="Surat Keluar"
              value={
                totalSuratKeluar
              }
            />

            <HeroMetric
              icon={
                <CheckCircle2
                  size={16}
                />
              }
              label="Surat Selesai"
              value={
                suratSelesai
              }
            />
          </div>
        </div>
      </section>


      {/* ==================================================
          RINGKASAN ADMINISTRASI
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
            Ringkasan Administrasi
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Informasi persuratan yang perlu dipantau.
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
            title="Surat Masuk"
            value={
              totalSuratMasuk
            }
            icon={
              <Inbox
                size={22}
              />
            }
            description="Surat diterima organisasi"
            color="cyan"
          />

          <CardStat
            title="Surat Keluar"
            value={
              totalSuratKeluar
            }
            icon={
              <Send
                size={22}
              />
            }
            description="Surat yang diterbitkan"
            color="purple"
          />

          <CardStat
            title="Menunggu Review"
            value={
              menungguApproval
            }
            icon={
              <ClipboardCheck
                size={22}
              />
            }
            description="Perlu ditindaklanjuti"
            color="orange"
          />

          <CardStat
            title="Surat Selesai"
            value={
              suratSelesai
            }
            icon={
              <CheckCircle2
                size={22}
              />
            }
            description="Arsip surat final"
            color="green"
          />
        </div>
      </section>


      {/* ==================================================
          AKSI CEPAT
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
            Aksi Cepat
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Akses pekerjaan administrasi yang
            paling sering digunakan.
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
          <ActionCard
            href="/surat/masuk/tambah"
            icon={
              <Inbox
                size={20}
              />
            }
            title="Input Surat Masuk"
            description="Catat surat yang diterima"
          />

          <ActionCard
            href="/surat/keluar/tambah"
            icon={
              <FilePlus2
                size={20}
              />
            }
            title="Buat Surat Keluar"
            description="Buat surat resmi organisasi"
          />

          <ActionCard
            href="/approval"
            icon={
              <ClipboardCheck
                size={20}
              />
            }
            title="Review Pengajuan"
            description={
              menungguApproval > 0
                ? `${menungguApproval} pengajuan menunggu`
                : "Tidak ada pengajuan menunggu"
            }
            highlight={
              menungguApproval > 0
            }
          />

          <ActionCard
            href="/loker"
            icon={
              <Archive
                size={20}
              />
            }
            title="Loker"
            description="Akses ruang kerja dan arsip"
          />
        </div>
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
// ACTION CARD
// ======================================================

function ActionCard({
  href,
  icon,
  title,
  description,
  highlight = false,
}: {
  href:
    string;

  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;

  highlight?:
    boolean;
}) {
  return (
    <Link
      href={
        href
      }
      className={`
        group
        rounded-3xl
        border
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        hover:shadow-cyan-100/60
        ${
          highlight
            ? "border-amber-200 ring-2 ring-amber-50"
            : "border-slate-200 hover:border-cyan-200"
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
        "
      >
        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            text-white
            shadow-md
            ${
              highlight
                ? "bg-gradient-to-br from-amber-500 to-orange-500"
                : "bg-gradient-to-br from-cyan-500 to-teal-500"
            }
          `}
        >
          {icon}
        </div>


        <ArrowUpRight
          size={18}
          className="
            text-slate-300
            transition
            duration-300
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:text-cyan-600
          "
        />
      </div>


      <h3
        className="
          mt-5
          font-semibold
          text-slate-900
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-1
          text-sm
          leading-relaxed
          text-slate-500
        "
      >
        {description}
      </p>
    </Link>
  );
}
