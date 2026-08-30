import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Mail,
  Save,
} from "lucide-react";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireSekretaris,
} from "@/lib/permissions";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(
  tanggal: Date
) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",

      timeZone:
        "Asia/Jakarta",
    }
  ).format(
    tanggal
  );
}


// ======================================================
// UPDATE SURAT KELUAR
// ======================================================

async function updateSuratKeluar(
  formData: FormData
) {
  "use server";


  const actor =
    await requireSekretaris();


  const id =
    String(
      formData.get(
        "id"
      ) ?? ""
    ).trim();


  const tujuan =
    String(
      formData.get(
        "tujuan"
      ) ?? ""
    ).trim();


  const perihal =
    String(
      formData.get(
        "perihal"
      ) ?? ""
    ).trim();


  const isiSurat =
    String(
      formData.get(
        "isiSurat"
      ) ?? ""
    ).trim();


  if (!id) {
    throw new Error(
      "ID surat keluar tidak ditemukan."
    );
  }


  if (!tujuan) {
    throw new Error(
      "Tujuan surat wajib diisi."
    );
  }


  if (!perihal) {
    throw new Error(
      "Perihal surat wajib diisi."
    );
  }


  if (!isiSurat) {
    throw new Error(
      "Isi surat wajib diisi."
    );
  }


  const existing =
    await prisma.suratKeluar.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        nomorSurat: true,
        status: true,
      },
    });


  if (!existing) {
    throw new Error(
      "Surat keluar tidak ditemukan."
    );
  }


  /*
   * Dokumen final tidak boleh diubah lagi.
   */
  if (
    existing.status !==
    "DIPROSES"
  ) {
    throw new Error(
      "Surat keluar yang sudah selesai tidak dapat diedit."
    );
  }


  const updated =
    await prisma.$transaction(
      async (tx) => {
        const surat =
          await tx.suratKeluar.update({
            where: {
              id,
            },

            data: {
              tujuan,
              perihal,
              isiSurat,
            },
          });


        await tx.auditLog.create({
          data: {
            userId:
              actor.id,

            modul:
              "PERSURATAN",

            dataId:
              surat.id,

            aktivitas:
              `Mengubah redaksi surat ${surat.nomorSurat}`,
          },
        });


        return surat;
      }
    );


  revalidatePath(
    "/surat/keluar"
  );


  revalidatePath(
    `/surat/keluar/${updated.id}`
  );


  revalidatePath(
    `/api/surat/keluar/${updated.id}/pdf`
  );


  redirect(
    `/surat/keluar/${updated.id}`
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function EditSuratKeluar({
  params,
}: PageProps) {
  await requireSekretaris();


  const {
    id,
  } = await params;


  if (!id) {
    notFound();
  }


  const surat =
    await prisma.suratKeluar.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        nomorSurat: true,
        kodeJenis: true,
        kodeNomor: true,
        tujuan: true,
        perihal: true,
        isiSurat: true,
        tanggalSurat: true,
        status: true,
      },
    });


  if (!surat) {
    notFound();
  }


  /*
   * URL /edit juga dikunci di server.
   */
  if (
    surat.status !==
    "DIPROSES"
  ) {
    redirect(
      `/surat/keluar/${surat.id}`
    );
  }


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-4xl
        space-y-7
      "
    >
      <Link
        href={`/surat/keluar/${surat.id}`}
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

        Kembali ke Detail
      </Link>


      <section>
        <p
          className="
            text-sm
            font-bold
            text-cyan-600
          "
        >
          Surat Keluar
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
          Edit Surat Keluar
        </h1>

        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Perbarui tujuan dan redaksi sebelum
          surat ditandai selesai. Nomor, jenis,
          dan tanggal surat tetap dikunci.
        </p>
      </section>


      <section
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >
        <ReadOnlyCard
          icon={
            <FileText
              size={18}
            />
          }
          label="Nomor Surat"
          value={
            surat.nomorSurat
          }
        />

        <ReadOnlyCard
          icon={
            <CalendarDays
              size={18}
            />
          }
          label="Tanggal Surat"
          value={
            formatTanggal(
              surat.tanggalSurat
            )
          }
        />
      </section>


      <form
        action={
          updateSuratKeluar
        }
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
          value={
            surat.id
          }
        />


        <div
          className="
            space-y-6
            p-6
            sm:p-8
          "
        >
          <div>
            <label
              htmlFor="tujuan"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Tujuan Surat
            </label>

            <div
              className="
                relative
              "
            >
              <Mail
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
                id="tujuan"
                name="tujuan"
                required
                defaultValue={
                  surat.tujuan
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
                  transition
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />
            </div>
          </div>


          <div>
            <label
              htmlFor="perihal"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Perihal
            </label>

            <input
              id="perihal"
              name="perihal"
              required
              defaultValue={
                surat.perihal
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
            />
          </div>


          <div>
            <label
              htmlFor="isiSurat"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Isi Surat
            </label>

            <textarea
              id="isiSurat"
              name="isiSurat"
              required
              rows={14}
              defaultValue={
                surat.isiSurat
              }
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
                leading-7
                text-slate-900
                outline-none
                transition
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

            <p
              className="
                mt-2
                text-xs
                leading-5
                text-slate-400
              "
            >
              PDF surat akan membaca redaksi
              terbaru dari database.
            </p>
          </div>
        </div>


        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-slate-100
            bg-slate-50/50
            px-6
            py-5
            sm:flex-row
            sm:justify-end
            sm:px-8
          "
        >
          <Link
            href={`/surat/keluar/${surat.id}`}
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
              shadow-sm
              transition
              hover:bg-cyan-700
            "
          >
            <Save
              size={17}
            />

            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}


// ======================================================
// READ ONLY CARD
// ======================================================

function ReadOnlyCard({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
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
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className="
            text-xs
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
            font-bold
            text-slate-800
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}
