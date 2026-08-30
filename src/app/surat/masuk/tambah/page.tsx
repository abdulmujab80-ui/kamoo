import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  Link2,
  MailPlus,
  Save,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireSekretaris } from "@/lib/permissions";

import {
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";


// ======================================================
// TAMBAH SURAT MASUK
// ======================================================

async function tambahSuratMasuk(
  formData: FormData
) {
  "use server";


  const actor =
    await requireSekretaris();


  const nomorSurat = String(
    formData.get("nomorSurat") ?? ""
  ).trim();


  const tanggalSuratRaw = String(
    formData.get("tanggalSurat") ?? ""
  ).trim();


  const asal = String(
    formData.get("asal") ?? ""
  ).trim();


  const perihal = String(
    formData.get("perihal") ?? ""
  ).trim();


  const fileUrlRaw = String(
    formData.get("fileUrl") ?? ""
  ).trim();


  // ====================================================
  // VALIDASI
  // ====================================================

  if (
    !nomorSurat ||
    !tanggalSuratRaw ||
    !asal ||
    !perihal
  ) {
    throw new Error(
      "Nomor surat, tanggal surat, asal, dan perihal wajib diisi."
    );
  }


  const tanggalSurat =
    new Date(
      `${tanggalSuratRaw}T00:00:00`
    );


  if (
    Number.isNaN(
      tanggalSurat.getTime()
    )
  ) {
    throw new Error(
      "Tanggal surat tidak valid."
    );
  }


  /*
   * Cegah input surat yang sama dua kali.
   *
   * Nomor surat saja tidak cukup karena
   * dua instansi berbeda bisa saja mempunyai
   * nomor yang sama.
   */
  const existing =
    await prisma.suratMasuk.findFirst({
      where: {
        nomorSurat,

        asal: {
          equals: asal,
          mode: "insensitive",
        },
      },
    });


  if (existing) {
    throw new Error(
      "Surat dengan nomor dan asal yang sama sudah tercatat."
    );
  }


  // ====================================================
  // CREATE
  // ====================================================

  const surat =
    await prisma.suratMasuk.create({
      data: {
        nomorSurat,

        tanggalSurat,

        asal,

        perihal,

        fileUrl:
          fileUrlRaw
            ? fileUrlRaw
            : null,

        /*
         * Surat masuk tidak melalui approval.
         *
         * Begitu diterima sekretaris,
         * surat masuk ke tahap DIPROSES.
         */
        status:
          "DIPROSES",
      },
    });


  // ====================================================
  // AUDIT LOG
  // ====================================================

  await prisma.auditLog.create({
    data: {
      userId:
        actor.id,

      aktivitas:
        `Mencatat surat masuk ${surat.nomorSurat} dari ${surat.asal}`,
    },
  });


  // ====================================================
  // REFRESH
  // ====================================================

  revalidatePath(
    "/surat/masuk"
  );


  revalidatePath(
    "/surat"
  );


  redirect(
    `/surat/masuk/${surat.id}`
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function TambahSuratMasukPage() {
  /*
   * Backend RBAC.
   *
   * Hanya:
   * SUPERADMIN
   * ADMIN_SEKRETARIS
   */
  await requireSekretaris();


  return (
    <div
      className="
        mx-auto
        max-w-5xl
        space-y-7
      "
    >

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href="/surat/masuk"
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

        Kembali ke Surat Masuk
      </Link>


      {/* ==================================================
          HEADER
      ================================================== */}

      <section>

        <p
          className="
            text-sm
            font-semibold
            text-cyan-600
          "
        >
          Persuratan
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
          Tambah Surat Masuk
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
          Catat surat yang diterima organisasi
          agar dapat diproses dan diarsipkan
          melalui KAMOO.
        </p>

      </section>


      {/* ==================================================
          FLOW INFO
      ================================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
      >

        <FlowCard
          number="1"
          title="Input Surat"
          description="Masukkan data surat diterima."
        />


        <FlowCard
          number="2"
          title="Diproses"
          description="Surat masuk ke administrasi."
        />


        <FlowCard
          number="3"
          title="Diarsipkan"
          description="Selesaikan setelah ditindaklanjuti."
        />

      </section>


      {/* ==================================================
          FORM
      ================================================== */}

      <form
        action={
          tambahSuratMasuk
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

        {/* FORM HEADER */}

        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-slate-100
            px-6
            py-5
            sm:px-8
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
            "
          >
            <MailPlus size={21} />
          </div>


          <div>

            <h2
              className="
                font-bold
                text-slate-900
              "
            >
              Informasi Surat
            </h2>


            <p
              className="
                mt-0.5
                text-sm
                text-slate-500
              "
            >
              Lengkapi data sesuai dokumen
              surat yang diterima.
            </p>

          </div>

        </div>


        {/* FORM BODY */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            p-6
            sm:p-8
            md:grid-cols-2
          "
        >

          {/* NOMOR SURAT */}

          <div>

            <label
              htmlFor="nomorSurat"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Nomor Surat

              <span
                className="
                  ml-1
                  text-red-500
                "
              >
                *
              </span>
            </label>


            <div
              className="
                relative
              "
            >

              <FileText
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
                id="nomorSurat"
                name="nomorSurat"
                required
                placeholder="Contoh: 015/UND/VIII/2026"
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
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />

            </div>

          </div>


          {/* TANGGAL SURAT */}

          <div>

            <label
              htmlFor="tanggalSurat"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Tanggal Surat

              <span
                className="
                  ml-1
                  text-red-500
                "
              >
                *
              </span>
            </label>


            <div
              className="
                relative
              "
            >

              <CalendarDays
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
                id="tanggalSurat"
                type="date"
                name="tanggalSurat"
                required
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


          {/* ASAL SURAT */}

          <div
            className="
              md:col-span-2
            "
          >

            <label
              htmlFor="asal"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Asal Surat

              <span
                className="
                  ml-1
                  text-red-500
                "
              >
                *
              </span>
            </label>


            <div
              className="
                relative
              "
            >

              <Building2
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
                id="asal"
                name="asal"
                required
                placeholder="Contoh: Pemerintah Desa Sidodadi"
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
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />

            </div>

          </div>


          {/* PERIHAL */}

          <div
            className="
              md:col-span-2
            "
          >

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

              <span
                className="
                  ml-1
                  text-red-500
                "
              >
                *
              </span>
            </label>


            <textarea
              id="perihal"
              name="perihal"
              required
              rows={4}
              placeholder="Tuliskan perihal atau ringkasan singkat surat..."
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
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* FILE */}

          <div
            className="
              md:col-span-2
            "
          >

            <label
              htmlFor="fileUrl"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Link Dokumen

              <span
                className="
                  ml-1
                  font-normal
                  text-slate-400
                "
              >
                (Opsional)
              </span>
            </label>


            <div
              className="
                relative
              "
            >

              <Link2
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
                id="fileUrl"
                type="url"
                name="fileUrl"
                placeholder="https://..."
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
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />

            </div>


            <p
              className="
                mt-2
                text-xs
                leading-5
                text-slate-400
              "
            >
              Gunakan tautan dokumen digital
              apabila surat sudah disimpan di
              penyimpanan organisasi.
            </p>

          </div>


          {/* INFO STATUS */}

          <div
            className="
              md:col-span-2
              rounded-2xl
              border
              border-cyan-100
              bg-cyan-50
              p-4
            "
          >

            <p
              className="
                text-sm
                font-bold
                text-cyan-800
              "
            >
              Status awal: DIPROSES
            </p>


            <p
              className="
                mt-1
                text-sm
                leading-6
                text-cyan-700
              "
            >
              Surat yang dicatat akan langsung
              masuk tahap administrasi. Setelah
              seluruh tindak lanjut selesai,
              sekretaris dapat mengubah status
              menjadi SELESAI.
            </p>

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
            px-6
            py-5
            sm:flex-row
            sm:justify-end
            sm:px-8
          "
        >

          <Link
            href="/surat/masuk"
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
            <Save size={17} />

            Simpan Surat Masuk
          </button>

        </div>

      </form>

    </div>
  );
}


// ======================================================
// FLOW CARD
// ======================================================

function FlowCard({
  number,
  title,
  description,
}: {
  number: string;

  title: string;

  description: string;
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
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-cyan-50
          text-sm
          font-extrabold
          text-cyan-700
        "
      >
        {number}
      </div>


      <div>

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
            text-xs
            leading-5
            text-slate-500
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}