import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  FolderOpen,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


// ======================================================
// ROLE YANG BOLEH MENGELOLA JADWAL
// ======================================================

const CAN_MANAGE = new Set([
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
  "ADMIN_BENDAHARA",
]);


function canManageJadwal(
  role: unknown
) {
  return CAN_MANAGE.has(
    String(role)
  );
}


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(value: Date) {
  return value.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// FORMAT JAM
// ======================================================

function formatJam(value: Date) {
  return value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// HAPUS JADWAL
// ======================================================

async function hapusJadwal(
  formData: FormData
) {
  "use server";

  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  if (
    !canManageJadwal(
      session.role
    )
  ) {
    redirect("/jadwal");
  }


  const id =
    String(
      formData.get("id") ?? ""
    ).trim();


  if (!id) {
    throw new Error(
      "ID kegiatan tidak ditemukan."
    );
  }


  const jadwal =
    await prisma.jadwal.findUnique({
      where: {
        id,
      },
    });


  if (!jadwal) {
    notFound();
  }


  await prisma.jadwal.delete({
    where: {
      id,
    },
  });


  await prisma.auditLog.create({
    data: {
      userId:
        String(
          session.id
        ),

      aktivitas:
        `Menghapus kegiatan "${jadwal.judul}"`,
    },
  });


  revalidatePath("/jadwal");
  revalidatePath("/dashboard");

  redirect("/jadwal");
}


// ======================================================
// PAGE
// ======================================================

export default async function DetailJadwal({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  // ====================================================
  // NEXT.JS 16
  // ====================================================

  const resolvedParams =
    await params;


  const id =
    resolvedParams.id;


  if (!id) {
    notFound();
  }


  // ====================================================
  // AMBIL DATA
  // ====================================================

  const jadwal =
    await prisma.jadwal.findUnique({
      where: {
        id,
      },
    });


  if (!jadwal) {
    notFound();
  }


  const canManage =
    canManageJadwal(
      session.role
    );


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-4xl
        space-y-6
      "
    >

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href="/jadwal"
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
        <ArrowLeft
          size={17}
        />

        Kembali ke Jadwal
      </Link>


      {/* ==================================================
          HEADER
      ================================================== */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-teal-600
          via-cyan-600
          to-cyan-500
          p-6
          text-white
          shadow-xl
          shadow-cyan-100
          sm:p-8
        "
      >

        <p
          className="
            text-xs
            font-bold
            uppercase
            tracking-[0.18em]
            text-white/70
          "
        >
          Detail Kegiatan
        </p>


        <h1
          className="
            mt-3
            text-2xl
            font-extrabold
            tracking-tight
            sm:text-3xl
          "
        >
          {jadwal.judul}
        </h1>


        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          "
        >

          <InfoPill
            icon={
              <CalendarDays
                size={17}
              />
            }
            text={
              formatTanggal(
                jadwal.mulai
              )
            }
          />


          <InfoPill
            icon={
              <Clock3
                size={17}
              />
            }
            text={`${formatJam(
              jadwal.mulai
            )} - ${formatJam(
              jadwal.selesai
            )}`}
          />


          {jadwal.lokasi && (
            <InfoPill
              icon={
                <MapPin
                  size={17}
                />
              }
              text={
                jadwal.lokasi
              }
            />
          )}

        </div>

      </section>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <section
        className="
          space-y-5
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-7
        "
      >

        {/* =================================================
            DESKRIPSI
        ================================================= */}

        <div>

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Deskripsi
          </p>


          <div
            className="
              mt-3
              rounded-2xl
              bg-slate-50
              p-5
            "
          >

            <p
              className="
                whitespace-pre-line
                text-sm
                leading-7
                text-slate-700
              "
            >
              {jadwal.deskripsi ||
                "Tidak ada deskripsi untuk kegiatan ini."}
            </p>

          </div>

        </div>


        {/* =================================================
            DOCUMENTATION
        ================================================= */}

        <div
          className="
            rounded-2xl
            border
            border-cyan-100
            bg-cyan-50/60
            p-5
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
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
                bg-white
                text-cyan-600
                shadow-sm
              "
            >
              <FolderOpen
                size={20}
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
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Dokumentasi Kegiatan
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Folder dokumentasi,
                foto, video, proposal,
                atau laporan kegiatan.
              </p>

            </div>

          </div>


          {jadwal.dokumentasiUrl ? (

            <a
              href={
                jadwal.dokumentasiUrl
              }
              target="_blank"
              rel="noreferrer"
              className="
                mt-4
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
                transition
                hover:bg-cyan-700
                sm:w-auto
              "
            >
              <FolderOpen
                size={17}
              />

              Buka Dokumentasi

              <ExternalLink
                size={14}
              />
            </a>

          ) : (

            <div
              className="
                mt-4
                rounded-xl
                border
                border-dashed
                border-cyan-200
                bg-white
                px-4
                py-3
                text-xs
                text-slate-500
              "
            >
              Dokumentasi kegiatan
              belum ditambahkan.
            </div>

          )}

        </div>


        {/* =================================================
            ACTION
        ================================================= */}

        {canManage && (

          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-100
              pt-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            {/* HAPUS */}

            <form
              action={
                hapusJadwal
              }
            >

              <input
                type="hidden"
                name="id"
                value={
                  jadwal.id
                }
              />


              <button
                type="submit"
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-rose-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-rose-600
                  transition
                  hover:bg-rose-50
                  sm:w-auto
                "
              >
                <Trash2
                  size={16}
                />

                Hapus Kegiatan
              </button>

            </form>


            {/* EDIT */}

            <Link
              href={`/jadwal/${jadwal.id}/edit`}
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
                transition
                hover:bg-cyan-700
              "
            >
              <Pencil
                size={16}
              />

              Edit Kegiatan
            </Link>

          </div>

        )}

      </section>

    </div>
  );
}


// ======================================================
// INFO PILL
// ======================================================

function InfoPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-3
        rounded-2xl
        border
        border-white/15
        bg-white/10
        px-4
        py-3
        backdrop-blur-sm
      "
    >

      <div
        className="
          shrink-0
          text-white/80
        "
      >
        {icon}
      </div>


      <span
        className="
          truncate
          text-sm
          font-semibold
          text-white
        "
      >
        {text}
      </span>

    </div>
  );
}