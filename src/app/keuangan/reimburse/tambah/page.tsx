import Link from "next/link";

import {
  ArrowLeft,
  Link2,
  Receipt,
  Save,
} from "lucide-react";

import {
  prisma,
} from "@/lib/prisma";

import {
  getSession,
} from "@/lib/auth";

import {
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";


// ======================================================
// SUBMIT
// ======================================================

async function tambahReimburse(
  formData: FormData
) {
  "use server";


  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  const keterangan =
    String(
      formData.get(
        "keterangan"
      ) ?? ""
    ).trim();


  const jumlahRaw =
    String(
      formData.get(
        "jumlah"
      ) ?? ""
    ).trim();


  const buktiUrlRaw =
    String(
      formData.get(
        "buktiUrl"
      ) ?? ""
    ).trim();


  if (!keterangan) {
    throw new Error(
      "Keterangan reimburse wajib diisi."
    );
  }


  const jumlah =
    Number(jumlahRaw);


  if (
    !Number.isFinite(jumlah) ||
    jumlah <= 0
  ) {
    throw new Error(
      "Jumlah reimburse harus lebih besar dari 0."
    );
  }


  let buktiUrl:
    string | null = null;


  if (buktiUrlRaw) {
    try {
      const url =
        new URL(
          buktiUrlRaw
        );


      if (
        url.protocol !==
          "http:" &&
        url.protocol !==
          "https:"
      ) {
        throw new Error();
      }


      buktiUrl =
        url.toString();
    } catch {
      throw new Error(
        "Link bukti tidak valid."
      );
    }
  }


  const reimburse =
    await prisma.reimburse.create({
      data: {
        userId:
          String(
            session.id
          ),

        keterangan,

        jumlah,

        buktiUrl,
      },
    });


  await prisma.auditLog.create({
    data: {
      userId:
        String(
          session.id
        ),

      aktivitas:
        `Mengajukan reimburse sebesar Rp${jumlah.toLocaleString(
          "id-ID"
        )}`,
    },
  });


  revalidatePath(
    "/keuangan/reimburse"
  );


  redirect(
    `/keuangan/reimburse/${reimburse.id}`
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function TambahReimburse() {
  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  return (
    <div
      className="
        mx-auto
        max-w-4xl
        space-y-7
      "
    >

      <Link
        href="/keuangan/reimburse"
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

        Kembali ke Reimburse
      </Link>


      {/* HEADER */}

      <section>

        <p
          className="
            text-sm
            font-semibold
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
          Ajukan Reimburse
        </h1>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Ajukan penggantian biaya yang
          sebelumnya kamu keluarkan untuk
          kepentingan organisasi.
        </p>

      </section>


      {/* FORM */}

      <form
        action={
          tambahReimburse
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
              items-center
              justify-center
              rounded-xl
              bg-cyan-50
              text-cyan-600
            "
          >
            <Receipt size={21} />
          </div>


          <div>

            <h2
              className="
                font-bold
                text-slate-900
              "
            >
              Detail Pengajuan
            </h2>


            <p
              className="
                mt-0.5
                text-sm
                text-slate-500
              "
            >
              Lengkapi informasi biaya dan
              bukti pendukung.
            </p>

          </div>

        </div>


        <div
          className="
            space-y-6
            p-6
            sm:p-8
          "
        >

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
              Keperluan / Keterangan

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
              id="keterangan"
              name="keterangan"
              required
              rows={5}
              placeholder="Contoh: Pembelian konsumsi rapat organisasi tanggal 28 Agustus 2026."
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


          {/* JUMLAH */}

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
              Jumlah Reimburse

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

              <span
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  font-bold
                  text-slate-400
                "
              >
                Rp
              </span>


              <input
                id="jumlah"
                type="number"
                name="jumlah"
                required
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="50000"
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
              Link Bukti Transaksi

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
                placeholder="https://drive.google.com/..."
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
              Untuk sementara bukti menggunakan
              tautan dokumen. Upload langsung
              ke storage akan kita tambahkan
              pada tahap berikutnya.
            </p>

          </div>


          {/* INFO WORKFLOW */}

          <div
            className="
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
              Alur pengajuan
            </p>


            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-2
                text-xs
                font-semibold
                text-cyan-700
              "
            >

              <span
                className="
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                "
              >
                Menunggu
              </span>


              <span>
                →
              </span>


              <span
                className="
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                "
              >
                Review Bendahara
              </span>


              <span>
                →
              </span>


              <span
                className="
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                "
              >
                Disetujui
              </span>


              <span>
                →
              </span>


              <span
                className="
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                "
              >
                Dibayar
              </span>

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
            href="/keuangan/reimburse"
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

            Kirim Pengajuan
          </button>

        </div>

      </form>

    </div>
  );
}