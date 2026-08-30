import Link from "next/link";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Link2,
  Save,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


// ======================================================
// SUBMIT
// ======================================================

async function tambahTransaksi(
  formData: FormData
) {
  "use server";

  const session =
    await getSession();

  if (!session) {
    redirect("/login");
  }


  if (
    session.role !== "SUPERADMIN" &&
    session.role !== "ADMIN_BENDAHARA"
  ) {
    redirect("/dashboard");
  }


  const jenis =
    String(
      formData.get("jenis") ?? ""
    ).trim();


  const kategori =
    String(
      formData.get("kategori") ?? ""
    ).trim();


  const keterangan =
    String(
      formData.get("keterangan") ?? ""
    ).trim();


  const pihak =
    String(
      formData.get("pihak") ?? ""
    ).trim();


  const jumlahRaw =
    String(
      formData.get("jumlah") ?? ""
    ).trim();


  const tanggalRaw =
    String(
      formData.get("tanggal") ?? ""
    ).trim();


  const buktiUrlRaw =
    String(
      formData.get("buktiUrl") ?? ""
    ).trim();


  // ====================================================
  // VALIDASI
  // ====================================================

  if (
    jenis !== "MASUK" &&
    jenis !== "KELUAR"
  ) {
    throw new Error(
      "Jenis transaksi tidak valid."
    );
  }


  if (!kategori) {
    throw new Error(
      "Kategori wajib diisi."
    );
  }


  if (!keterangan) {
    throw new Error(
      "Keterangan wajib diisi."
    );
  }


  const jumlah =
    Number(jumlahRaw);


  if (
    !Number.isFinite(jumlah) ||
    jumlah <= 0
  ) {
    throw new Error(
      "Jumlah harus lebih besar dari 0."
    );
  }


  if (!tanggalRaw) {
    throw new Error(
      "Tanggal wajib diisi."
    );
  }


  const tanggal =
    new Date(
      `${tanggalRaw}T00:00:00`
    );


  if (
    Number.isNaN(
      tanggal.getTime()
    )
  ) {
    throw new Error(
      "Tanggal tidak valid."
    );
  }


  let buktiUrl:
    string | null = null;


  if (buktiUrlRaw) {
    try {
      const parsed =
        new URL(
          buktiUrlRaw
        );


      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        throw new Error();
      }


      buktiUrl =
        parsed.toString();

    } catch {
      throw new Error(
        "Link bukti tidak valid."
      );
    }
  }


  // ====================================================
  // CREATE
  // ====================================================

  await prisma.keuangan.create({
    data: {
      jenis:
        jenis as
          "MASUK" |
          "KELUAR",

      kategori,

      keterangan,

      pihak:
        pihak
          ? pihak
          : null,

      jumlah,

      tanggal,

      buktiUrl,
    },
  });


  // ====================================================
  // AUDIT
  // ====================================================

  await prisma.auditLog.create({
    data: {
      userId:
        String(
          session.id
        ),

      aktivitas:
        `Menambahkan transaksi ${jenis} ` +
        `${kategori} sebesar ` +
        `Rp${jumlah.toLocaleString(
          "id-ID"
        )}`,
    },
  });


  // ====================================================
  // REFRESH
  // ====================================================

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/keuangan"
  );

  revalidatePath(
    "/keuangan/masuk"
  );

  revalidatePath(
    "/keuangan/keluar"
  );

  revalidatePath(
    "/keuangan/laporan"
  );


  // ====================================================
  // REDIRECT YANG BENAR
  // ====================================================

  if (jenis === "MASUK") {
    redirect(
      "/keuangan/masuk"
    );
  }

  redirect(
    "/keuangan/keluar"
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function TambahTransaksi() {
  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  if (
    session.role !== "SUPERADMIN" &&
    session.role !== "ADMIN_BENDAHARA"
  ) {
    redirect("/dashboard");
  }


  return (
    <div
      className="
        mx-auto
        max-w-4xl
        space-y-7
      "
    >

      {/* BACK */}

      <Link
        href="/dashboard"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-500
          hover:text-cyan-700
        "
      >
        <ArrowLeft
          size={17}
        />

        Kembali ke Dashboard
      </Link>


      {/* HEADER */}

      <section>

        <p
          className="
            text-sm
            font-bold
            text-cyan-600
          "
        >
          Keuangan
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
          Tambah Transaksi
        </h1>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Catat pemasukan atau pengeluaran
          organisasi.
        </p>

      </section>


      {/* FORM */}

      <form
        action={
          tambahTransaksi
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

        <div
          className="
            space-y-6
            p-6
            sm:p-8
          "
        >

          {/* JENIS */}

          <div>

            <label
              htmlFor="jenis"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Jenis Transaksi
            </label>


            <select
              id="jenis"
              name="jenis"
              defaultValue="MASUK"
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
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            >

              <option value="MASUK">
                Uang Masuk
              </option>

              <option value="KELUAR">
                Uang Keluar
              </option>

            </select>

          </div>


          {/* KATEGORI */}

          <div>

            <label
              htmlFor="kategori"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Kategori
            </label>


            <input
              id="kategori"
              name="kategori"
              required
              placeholder="Contoh: Iuran Anggota"
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


          {/* PIHAK */}

          <div>

            <label
              htmlFor="pihak"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Pihak

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


            <input
              id="pihak"
              name="pihak"
              placeholder="Nama sumber dana / penerima"
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


          {/* KETERANGAN */}

          <div>

            <label
              htmlFor="keterangan"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Keterangan
            </label>


            <textarea
              id="keterangan"
              name="keterangan"
              required
              rows={5}
              placeholder="Contoh: Pembayaran iuran anggota bulan Agustus 2026."
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
                placeholder:text-slate-400
                focus:border-cyan-400
                focus:bg-white
                focus:ring-4
                focus:ring-cyan-50
              "
            />

          </div>


          {/* JUMLAH + TANGGAL */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
            "
          >

            <div>

              <label
                htmlFor="jumlah"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Jumlah
              </label>


              <input
                id="jumlah"
                type="number"
                name="jumlah"
                required
                min="1"
                step="1"
                placeholder="100000"
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


            <div>

              <label
                htmlFor="tanggal"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Tanggal
              </label>


              <div className="relative">

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
                  id="tanggal"
                  type="date"
                  name="tanggal"
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
                    focus:border-cyan-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-cyan-50
                  "
                />

              </div>

            </div>

          </div>


          {/* BUKTI */}

          <div>

            <label
              htmlFor="buktiUrl"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Link Bukti

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
                id="buktiUrl"
                type="url"
                name="buktiUrl"
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
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />

            </div>

          </div>

        </div>


        {/* ACTION */}

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
            href="/dashboard"
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
              hover:bg-cyan-700
            "
          >

            <Save size={17} />

            Simpan Transaksi

          </button>

        </div>

      </form>

    </div>
  );
}