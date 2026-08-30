import Link from "next/link";
import { FileText, Save, ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireSekretaris } from "@/lib/permissions";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


async function tambahSuratKeluar(formData: FormData) {
  "use server";

  await requireSekretaris();


  const nomorSurat = String(
    formData.get("nomorSurat") ?? ""
  ).trim();

  const tujuan = String(
    formData.get("tujuan") ?? ""
  ).trim();

  const perihal = String(
    formData.get("perihal") ?? ""
  ).trim();

  const isiSurat = String(
    formData.get("isiSurat") ?? ""
  ).trim();

  const tanggalSuratRaw = String(
    formData.get("tanggalSurat") ?? ""
  ).trim();

  const fileUrlRaw = String(
    formData.get("fileUrl") ?? ""
  ).trim();


  if (
    !nomorSurat ||
    !tujuan ||
    !perihal ||
    !isiSurat ||
    !tanggalSuratRaw
  ) {
    throw new Error(
      "Nomor surat, tujuan, perihal, isi surat, dan tanggal wajib diisi."
    );
  }


  const tanggalSurat = new Date(
    `${tanggalSuratRaw}T00:00:00`
  );


  if (Number.isNaN(tanggalSurat.getTime())) {
    throw new Error("Tanggal surat tidak valid.");
  }


  await prisma.suratKeluar.create({
    data: {
      nomorSurat,

      tujuan,

      perihal,

      isiSurat,

      tanggalSurat,

      fileUrl:
        fileUrlRaw.length > 0
          ? fileUrlRaw
          : null,

      status: "DIPROSES",
    },
  });


  revalidatePath("/surat/keluar");

  redirect("/surat/keluar");
}


export default async function TambahSuratKeluarPage() {
  await requireSekretaris();


  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* BACK */}

      <Link
        href="/surat/keluar"
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

        Kembali ke Surat Keluar
      </Link>


      {/* HEADER */}

      <section>

        <p className="text-sm font-semibold text-cyan-600">
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
          Buat Surat Keluar
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Tambahkan surat keluar secara manual ke dalam
          sistem KAMOO.
        </p>

      </section>


      {/* FORM */}

      <form
        action={tambahSuratKeluar}
        className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          sm:p-8
        "
      >

        <div
          className="
            mb-7
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-cyan-50
              text-cyan-600
            "
          >
            <FileText size={21} />
          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              Informasi Surat
            </h2>

            <p className="text-sm text-slate-500">
              Lengkapi data surat yang akan disimpan.
            </p>

          </div>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
          "
        >

          {/* NOMOR SURAT */}

          <div className="md:col-span-2">

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
            </label>

            <input
              id="nomorSurat"
              name="nomorSurat"
              required
              placeholder="Contoh: 01.SB.04/KATI/26.08.2026"
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
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* TUJUAN */}

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

            <input
              id="tujuan"
              name="tujuan"
              required
              placeholder="Contoh: Universitas / Instansi"
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
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* TANGGAL */}

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
            </label>

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


          {/* PERIHAL */}

          <div className="md:col-span-2">

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
              placeholder="Contoh: Permohonan Kerja Sama"
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
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* ISI SURAT */}

          <div className="md:col-span-2">

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
              rows={8}
              placeholder="Tuliskan isi surat..."
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


          {/* FILE URL */}

          <div className="md:col-span-2">

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
              Link File Surat
              <span className="ml-1 font-normal text-slate-400">
                (Opsional)
              </span>
            </label>

            <input
              id="fileUrl"
              name="fileUrl"
              type="url"
              placeholder="https://..."
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
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>

        </div>


        {/* ACTION */}

        <div
          className="
            mt-8
            flex
            flex-col-reverse
            gap-3
            border-t
            border-slate-100
            pt-6
            sm:flex-row
            sm:justify-end
          "
        >

          <Link
            href="/surat/keluar"
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

            Simpan Surat
          </button>

        </div>

      </form>

    </div>
  );
}