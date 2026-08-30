import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";


type SearchParams = {
  bulan?: string;
  tahun?: string;
};


// ======================================================
// ROLE
// ======================================================

const CAN_MANAGE = new Set([
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
  "ADMIN_BENDAHARA",
]);

function canManageJadwal(role: unknown) {
  return CAN_MANAGE.has(String(role));
}


// ======================================================
// FORMAT
// ======================================================

function formatTanggal(value: Date) {
  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}


function formatJam(value: Date) {
  return value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// WARNA EVENT
// ======================================================

function getEventStyle(index: number) {
  const styles = [
    "border-cyan-200 bg-cyan-50 text-cyan-700",
    "border-emerald-200 bg-emerald-50 text-emerald-700",
    "border-violet-200 bg-violet-50 text-violet-700",
    "border-amber-200 bg-amber-50 text-amber-700",
    "border-rose-200 bg-rose-50 text-rose-700",
  ];

  return styles[index % styles.length];
}


// ======================================================
// PAGE
// ======================================================

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }


  const params = await searchParams;

  const now = new Date();

  const requestedMonth = Number(
    params.bulan
  );

  const requestedYear = Number(
    params.tahun
  );


  const currentMonth =
    Number.isInteger(requestedMonth) &&
    requestedMonth >= 1 &&
    requestedMonth <= 12
      ? requestedMonth - 1
      : now.getMonth();


  const currentYear =
    Number.isInteger(requestedYear) &&
    requestedYear >= 2000 &&
    requestedYear <= 2100
      ? requestedYear
      : now.getFullYear();


  const firstDay = new Date(
    currentYear,
    currentMonth,
    1
  );


  const lastDay = new Date(
    currentYear,
    currentMonth + 1,
    1
  );


  const jadwal = await prisma.jadwal.findMany({
    where: {
      mulai: {
        lt: lastDay,
      },
      selesai: {
        gte: firstDay,
      },
    },

    orderBy: {
      mulai: "asc",
    },
  });


  const firstWeekday =
    firstDay.getDay();


  const totalDays =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();


  const namaBulan =
    firstDay.toLocaleDateString(
      "id-ID",
      {
        month: "long",
        year: "numeric",
      }
    );


  const previousDate = new Date(
    currentYear,
    currentMonth - 1,
    1
  );


  const nextDate = new Date(
    currentYear,
    currentMonth + 1,
    1
  );


  const previousHref =
    `/jadwal?bulan=${
      previousDate.getMonth() + 1
    }&tahun=${
      previousDate.getFullYear()
    }`;


  const nextHref =
    `/jadwal?bulan=${
      nextDate.getMonth() + 1
    }&tahun=${
      nextDate.getFullYear()
    }`;


  const today =
    new Date(
      now.toLocaleString(
        "en-US",
        {
          timeZone:
            "Asia/Jakarta",
        }
      )
    );


  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 sm:space-y-7">

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

        <div className="min-w-0">

          <p className="text-sm font-bold text-cyan-600">
            Organisasi
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
            Jadwal Kegiatan
          </h1>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
              sm:text-base
            "
          >
            Agenda kegiatan organisasi KAMOO.
          </p>

        </div>


        {canManageJadwal(session.role) && (
          <Link
            href="/jadwal/tambah"
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
            <Plus size={18} />
            Tambah Kegiatan
          </Link>
        )}

      </section>


      {/* ==================================================
          CALENDAR
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

        {/* CALENDAR HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-slate-100
            px-4
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          "
        >

          <div className="flex items-center gap-3">

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
              <CalendarDays size={19} />
            </div>


            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Kalender
              </p>


              <h2
                className="
                  mt-0.5
                  text-lg
                  font-extrabold
                  capitalize
                  text-slate-900
                  sm:text-xl
                "
              >
                {namaBulan}
              </h2>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              justify-between
              gap-2
              sm:justify-end
            "
          >

            <Link
              href="/jadwal"
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-xs
                font-bold
                text-slate-700
                transition
                hover:border-cyan-200
                hover:bg-cyan-50
                hover:text-cyan-700
              "
            >
              Hari Ini
            </Link>


            <div
              className="
                flex
                items-center
                gap-1
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-1
              "
            >

              <Link
                href={previousHref}
                aria-label="Bulan sebelumnya"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500
                  transition
                  hover:bg-white
                  hover:text-cyan-700
                "
              >
                <ChevronLeft size={18} />
              </Link>


              <Link
                href={nextHref}
                aria-label="Bulan berikutnya"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500
                  transition
                  hover:bg-white
                  hover:text-cyan-700
                "
              >
                <ChevronRight size={18} />
              </Link>

            </div>

          </div>

        </div>


        {/* MOBILE NOTICE */}

        <div
          className="
            border-b
            border-slate-100
            bg-slate-50/60
            px-4
            py-3
            text-xs
            text-slate-500
            md:hidden
          "
        >
          Ketuk agenda untuk melihat detail kegiatan.
        </div>


        {/* WEEK HEADER */}

        <div
          className="
            grid
            grid-cols-7
            border-b
            border-slate-100
            bg-slate-50
          "
        >

          {[
            "Min",
            "Sen",
            "Sel",
            "Rab",
            "Kam",
            "Jum",
            "Sab",
          ].map((day) => (

            <div
              key={day}
              className="
                px-1
                py-3
                text-center
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
                sm:px-2
                sm:text-xs
              "
            >
              {day}
            </div>

          ))}

        </div>


        {/* CALENDAR GRID */}

        <div
          className="
            grid
            grid-cols-7
          "
        >

          {Array.from({
            length:
              firstWeekday,
          }).map((_, index) => (

            <div
              key={`empty-${index}`}
              className="
                min-h-[100px]
                border-b
                border-r
                border-slate-100
                bg-slate-50/30
                sm:min-h-[135px]
              "
            />

          ))}


          {Array.from({
            length:
              totalDays,
          }).map((_, index) => {

            const day =
              index + 1;


            const cellDate =
              new Date(
                currentYear,
                currentMonth,
                day
              );


            const cellEvents =
              jadwal.filter(
                (item) => {

                  const start =
                    item.mulai;

                  const end =
                    item.selesai;

                  const sameStart =
                    start.getFullYear() ===
                      currentYear &&
                    start.getMonth() ===
                      currentMonth &&
                    start.getDate() ===
                      day;

                  const spansDay =
                    start <
                      cellDate &&
                    end >=
                      cellDate;

                  return (
                    sameStart ||
                    spansDay
                  );
                }
              );


            const isToday =
              cellDate.getFullYear() ===
                today.getFullYear() &&
              cellDate.getMonth() ===
                today.getMonth() &&
              cellDate.getDate() ===
                today.getDate();


            return (
              <div
                key={day}
                className="
                  min-h-[100px]
                  border-b
                  border-r
                  border-slate-100
                  p-1.5
                  sm:min-h-[135px]
                  sm:p-2.5
                "
              >

                {/* DATE */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span
                    className={`
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      text-xs
                      font-bold
                      sm:h-8
                      sm:w-8
                      sm:text-sm

                      ${
                        isToday
                          ? "bg-cyan-600 text-white"
                          : "text-slate-600"
                      }
                    `}
                  >
                    {day}
                  </span>


                  {cellEvents.length > 0 && (
                    <span
                      className="
                        text-[9px]
                        font-semibold
                        text-slate-400
                        sm:hidden
                      "
                    >
                      {cellEvents.length}
                    </span>
                  )}

                </div>


                {/* EVENTS */}

                <div
                  className="
                    mt-2
                    space-y-1.5
                  "
                >

                  {cellEvents
                    .slice(0, 3)
                    .map(
                      (
                        item,
                        eventIndex
                      ) => (

                        <Link
                          key={item.id}
                          href={`/jadwal/${item.id}`}
                          className={`
                            group
                            block
                            rounded-lg
                            border
                            p-1.5
                            transition
                            hover:-translate-y-0.5
                            hover:shadow-sm
                            sm:p-2
                            ${getEventStyle(
                              eventIndex
                            )}
                          `}
                        >

                          <p
                            className="
                              truncate
                              text-[9px]
                              font-bold
                              sm:text-[11px]
                            "
                            title={
                              item.judul
                            }
                          >
                            {item.judul}
                          </p>


                          <p
                            className="
                              mt-0.5
                              hidden
                              items-center
                              gap-1
                              text-[9px]
                              opacity-75
                              sm:flex
                            "
                          >
                            <Clock3 size={9} />

                            {formatJam(
                              item.mulai
                            )}

                          </p>

                        </Link>

                      )
                    )}


                  {cellEvents.length > 3 && (

                    <Link
                      href="#agenda"
                      className="
                        block
                        px-1
                        text-[9px]
                        font-semibold
                        text-slate-400
                        hover:text-cyan-700
                        sm:text-[10px]
                      "
                    >
                      +
                      {cellEvents.length - 3}
                      {" "}
                      agenda lainnya
                    </Link>

                  )}

                </div>

              </div>
            );
          })}

        </div>

      </section>


      {/* ==================================================
          UPCOMING
      ================================================== */}

      <section
        id="agenda"
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
            px-5
            py-5
            sm:px-6
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
            Agenda Bulan Ini
          </h2>


          <p
            className="
              mt-1
              text-xs
              text-slate-500
              sm:text-sm
            "
          >
            Daftar kegiatan yang terjadwal
            pada periode ini.
          </p>

        </div>


        {jadwal.length === 0 ? (

          <div
            className="
              flex
              min-h-[230px]
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
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-cyan-50
                text-cyan-600
              "
            >
              <CalendarDays size={22} />
            </div>


            <p
              className="
                mt-4
                text-sm
                font-bold
                text-slate-700
              "
            >
              Belum ada kegiatan
            </p>


            <p
              className="
                mt-1
                max-w-sm
                text-sm
                leading-6
                text-slate-400
              "
            >
              Agenda yang dibuat akan muncul
              di kalender ini.
            </p>

          </div>

        ) : (

          <div
            className="
              divide-y
              divide-slate-100
            "
          >

            {jadwal.map(
              (item, index) => (

                <Link
                  key={item.id}
                  href={`/jadwal/${item.id}`}
                  className="
                    group
                    flex
                    items-start
                    gap-4
                    p-5
                    transition
                    hover:bg-slate-50
                    sm:px-6
                  "
                >

                  <div
                    className={`
                      mt-0.5
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      ${getEventStyle(
                        index
                      )}
                    `}
                  >
                    <CalendarDays
                      size={18}
                    />
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
                        sm:text-base
                      "
                    >
                      {item.judul}
                    </p>


                    <div
                      className="
                        mt-1
                        flex
                        flex-col
                        gap-1
                        text-xs
                        text-slate-500
                        sm:flex-row
                        sm:flex-wrap
                        sm:gap-3
                      "
                    >

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                        "
                      >
                        <CalendarDays
                          size={13}
                        />

                        {formatTanggal(
                          item.mulai
                        )}
                      </span>


                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                        "
                      >
                        <Clock3
                          size={13}
                        />

                        {formatJam(
                          item.mulai
                        )}
                        {" - "}
                        {formatJam(
                          item.selesai
                        )}
                      </span>


                      {item.lokasi && (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                          "
                        >
                          <MapPin
                            size={13}
                          />

                          <span className="truncate">
                            {item.lokasi}
                          </span>
                        </span>

                      )}

                    </div>

                  </div>


                  <ChevronRight
                    size={17}
                    className="
                      mt-2
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

      </section>

    </div>
  );
}