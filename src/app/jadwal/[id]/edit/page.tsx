import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FolderOpen,
  Link2,
  MapPin,
  Save,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


const CAN_MANAGE = new Set([
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
  "ADMIN_BENDAHARA",
]);


function canManageJadwal(role: unknown) {
  return CAN_MANAGE.has(
    String(role)
  );
}


// ======================================================
// FORMAT INPUT DATE
// ======================================================

function formatDateInput(value: Date) {
  return value.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// FORMAT INPUT TIME
// ======================================================

function formatTimeInput(value: Date) {
  return value.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// UPDATE
// ======================================================

async function updateJadwal(
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

  const judul =
    String(
      formData.get("judul") ?? ""
    ).trim();

  const deskripsi =
    String(
      formData.get("deskripsi") ?? ""
    ).trim();

  const lokasi =
    String(
      formData.get("lokasi") ?? ""
    ).trim();

  const tanggalMulai =
    String(
      formData.get("mulai") ?? ""
    ).trim();

  const jamMulai =
    String(
      formData.get("jamMulai") ?? ""
    ).trim();

  const tanggalSelesai =
    String(
      formData.get("selesai") ?? ""
    ).trim();

  const jamSelesai =
    String(
      formData.get("jamSelesai") ?? ""
    ).trim();

  const dokumentasiUrl =
    String(
      formData.get(
        "dokumentasiUrl"
      ) ?? ""
    ).trim();


  // ====================================================
  // VALIDASI
  // ====================================================

  if (!id) {
    throw new Error(
      "ID kegiatan tidak ditemukan."
    );
  }

  if (!judul) {
    throw new Error(
      "Nama kegiatan wajib diisi."
    );
  }

  if (
    !tanggalMulai ||
    !jamMulai ||
    !tanggalSelesai ||
    !jamSelesai
  ) {
    throw new Error(
      "Tanggal dan waktu kegiatan wajib diisi."
    );
  }


  const mulai =
    new Date(
      `${tanggalMulai}T${jamMulai}:00`
    );

  const selesai =
    new Date(
      `${tanggalSelesai}T${jamSelesai}:00`
    );


  if (
    Number.isNaN(
      mulai.getTime()
    ) ||
    Number.isNaN(
      selesai.getTime()
    )
  ) {
    throw new Error(
      "Tanggal atau waktu tidak valid."
    );
  }


  if (selesai < mulai) {
    throw new Error(
      "Waktu selesai tidak boleh lebih awal dari waktu mulai."
    );
  }


  let cleanDocumentationUrl:
    string | null = null;


  if (dokumentasiUrl) {
    try {
      const parsed =
        new URL(
          dokumentasiUrl
        );

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        throw new Error();
      }

      cleanDocumentationUrl =
        parsed.toString();
    } catch {
      throw new Error(
        "Link dokumentasi tidak valid."
      );
    }
  }


  // ====================================================
  // CEK KEGIATAN
  // ====================================================

  const existing =
    await prisma.jadwal.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    notFound();
  }


  // ====================================================
  // UPDATE
  // ====================================================

  await prisma.jadwal.update({
    where: {
      id,
    },

    data: {
      judul,

      deskripsi:
        deskripsi || null,

      lokasi:
        lokasi || null,

      mulai,

      selesai,

      dokumentasiUrl:
        cleanDocumentationUrl,
    },
  });


  // ====================================================
  // AUDIT LOG
  // ====================================================

  await prisma.auditLog.create({
    data: {
      userId:
        String(
          session.id
        ),

      aktivitas:
        `Mengubah kegiatan "${judul}"`,
    },
  });


  // ====================================================
  // REVALIDATE
  // ====================================================

  revalidatePath("/jadwal");

  revalidatePath(
    `/jadwal/${id}`
  );

  revalidatePath(
    `/jadwal/${id}/edit`
  );

  revalidatePath("/dashboard");


  redirect(
    `/jadwal/${id}`
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function EditJadwal({
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

  if (
    !canManageJadwal(
      session.role
    )
  ) {
    redirect("/jadwal");
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


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-3xl
        space-y-7
      "
    >

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href={`/jadwal/${jadwal.id}`}
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
        <ArrowLeft size={17} />

        Kembali ke Detail
      </Link>


      {/* ==================================================
          HEADER
      ================================================== */}

      <section>

        <p
          className="
            text-sm
            font-bold
            text-cyan-600
          "
        >
          Jadwal Kegiatan
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
          Edit Kegiatan
        </h1>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Perbarui informasi agenda kegiatan organisasi KAMOO.
        </p>

      </section>


      {/* ==================================================
          FORM
      ================================================== */}

      <form
        action={updateJadwal}
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <input
          type="hidden"
          name="id"
          value={jadwal.id}
        />


        <div
          className="
            space-y-6
            p-5
            sm:p-7
          "
        >

          {/* =================================================
              JUDUL
          ================================================= */}

          <div>

            <label
              htmlFor="judul"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Nama Kegiatan
            </label>


            <input
              id="judul"
              name="judul"
              required
              defaultValue={
                jadwal.judul
              }
              placeholder="Contoh: Rapat Pengurus Bulanan"
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
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* =================================================
              DESKRIPSI
          ================================================= */}

          <div>

            <label
              htmlFor="deskripsi"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Deskripsi
            </label>


            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={5}
              defaultValue={
                jadwal.deskripsi ??
                ""
              }
              placeholder="Jelaskan tujuan atau informasi penting terkait kegiatan."
              className="
                w-full
                resize-y
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-sm
                leading-6
                text-slate-900
                outline-none
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* =================================================
              LOKASI
          ================================================= */}

          <div>

            <label
              htmlFor="lokasi"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Lokasi
            </label>


            <div
              className="
                relative
              "
            >

              <MapPin
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />


              <input
                id="lokasi"
                name="lokasi"
                defaultValue={
                  jadwal.lokasi ??
                  ""
                }
                placeholder="Contoh: Balai Rakyat Dusun Umbelrejo"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />

            </div>

          </div>


          {/* =================================================
              WAKTU MULAI
          ================================================= */}

          <div>

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <CalendarDays
                size={17}
                className="text-cyan-600"
              />

              <p
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Waktu Mulai
              </p>

            </div>


            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >

              <div>

                <label
                  htmlFor="mulai"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-500
                  "
                >
                  Tanggal
                </label>


                <input
                  id="mulai"
                  type="date"
                  name="mulai"
                  required
                  defaultValue={
                    formatDateInput(
                      jadwal.mulai
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
                    focus:border-cyan-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-50
                  "
                />

              </div>


              <div>

                <label
                  htmlFor="jamMulai"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-500
                  "
                >
                  Jam
                </label>


                <div className="relative">

                  <Clock3
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />


                  <input
                    id="jamMulai"
                    type="time"
                    name="jamMulai"
                    required
                    defaultValue={
                      formatTimeInput(
                        jadwal.mulai
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      focus:border-cyan-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-cyan-50
                    "
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              WAKTU SELESAI
          ================================================= */}

          <div>

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <Clock3
                size={17}
                className="text-cyan-600"
              />

              <p
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Waktu Selesai
              </p>

            </div>


            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >

              <div>

                <label
                  htmlFor="selesai"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-500
                  "
                >
                  Tanggal
                </label>


                <input
                  id="selesai"
                  type="date"
                  name="selesai"
                  required
                  defaultValue={
                    formatDateInput(
                      jadwal.selesai
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
                    focus:border-cyan-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-50
                  "
                />

              </div>


              <div>

                <label
                  htmlFor="jamSelesai"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-500
                  "
                >
                  Jam
                </label>


                <div className="relative">

                  <Clock3
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />


                  <input
                    id="jamSelesai"
                    type="time"
                    name="jamSelesai"
                    required
                    defaultValue={
                      formatTimeInput(
                        jadwal.selesai
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      focus:border-cyan-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-cyan-50
                    "
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              DOKUMENTASI
          ================================================= */}

          <div
            className="
              rounded-2xl
              border
              border-cyan-100
              bg-cyan-50/60
              p-4
              sm:p-5
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
                  h-10
                  w-10
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
                  size={19}
                />
              </div>


              <div
                className="
                  min-w-0
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
                  Perbarui link folder dokumentasi
                  kegiatan jika diperlukan.
                </p>

              </div>

            </div>


            <div
              className="
                relative
                mt-4
              "
            >

              <Link2
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />


              <input
                id="dokumentasiUrl"
                type="url"
                name="dokumentasiUrl"
                defaultValue={
                  jadwal.dokumentasiUrl ??
                  ""
                }
                placeholder="https://drive.google.com/drive/folders/..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />

            </div>

          </div>

        </div>


        {/* ==================================================
            ACTION
        ================================================== */}

        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-slate-100
            bg-slate-50/50
            px-5
            py-5
            sm:flex-row
            sm:justify-end
            sm:px-7
          "
        >

          <Link
            href={`/jadwal/${jadwal.id}`}
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            Batal
          </Link>


          <button
            type="submit"
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

            <Save size={17} />

            Simpan Perubahan

          </button>

        </div>

      </form>

    </div>
  );
}