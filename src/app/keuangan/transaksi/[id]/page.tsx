import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Pencil,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


// ======================================================
// TYPES
// ======================================================

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// FORMAT
// ======================================================

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}


function formatTanggal(value: Date) {
  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// HAPUS TRANSAKSI
// ======================================================

async function hapusTransaksi(
  formData: FormData
) {
  "use server";

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }


  if (
    session.role !== "SUPERADMIN" &&
    session.role !== "ADMIN_BENDAHARA"
  ) {
    redirect("/dashboard");
  }


  const id = String(
    formData.get("id") ?? ""
  ).trim();


  if (!id) {
    throw new Error(
      "ID transaksi tidak ditemukan."
    );
  }


  const transaksi =
    await prisma.keuangan.findUnique({
      where: { id },
    });


  if (!transaksi) {
    throw new Error(
      "Transaksi tidak ditemukan."
    );
  }


  // Transaksi yang berasal dari reimburse
  // tidak boleh dihapus secara manual.
  if (transaksi.reimburseId) {
    throw new Error(
      "Transaksi reimburse tidak boleh dihapus dari menu transaksi."
    );
  }


  await prisma.$transaction(
    async (tx) => {
      await tx.keuangan.delete({
        where: { id },
      });


      await tx.auditLog.create({
        data: {
          userId: String(
            session.id
          ),
          aktivitas:
            `Menghapus transaksi ${transaksi.jenis} ` +
            `${transaksi.kategori} sebesar ` +
            `Rp${transaksi.jumlah.toLocaleString(
              "id-ID"
            )}`,
        },
      });
    }
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

  redirect(
    transaksi.jenis === "MASUK"
      ? "/keuangan/masuk"
      : "/keuangan/keluar"
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function DetailTransaksi({
  params,
}: PageProps) {
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


  const { id } = await params;


  if (!id) {
    notFound();
  }


  const transaksi =
    await prisma.keuangan.findUnique({
      where: {
        id,
      },

      include: {
        reimburse: {
          include: {
            user: true,
          },
        },
      },
    });


  if (!transaksi) {
    notFound();
  }


  const isMasuk =
    transaksi.jenis === "MASUK";


  const sourcePath =
    isMasuk
      ? "/keuangan/masuk"
      : "/keuangan/keluar";


  return (
    <div
      className="
        mx-auto
        max-w-4xl
        space-y-7
      "
    >

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href={sourcePath}
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

        Kembali ke{" "}
        {isMasuk
          ? "Uang Masuk"
          : "Uang Keluar"}
      </Link>


      {/* ==================================================
          HEADER
      ================================================== */}

      <section
        className={`
          overflow-hidden
          rounded-3xl
          text-white
          shadow-lg

          ${
            isMasuk
              ? "bg-gradient-to-r from-emerald-600 to-teal-500"
              : "bg-gradient-to-r from-rose-600 to-orange-500"
          }
        `}
      >

        <div
          className="
            p-6
            sm:p-8
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-white/15
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                "
              >

                {isMasuk ? (
                  <TrendingUp
                    size={14}
                  />
                ) : (
                  <TrendingDown
                    size={14}
                  />
                )}

                {isMasuk
                  ? "Uang Masuk"
                  : "Uang Keluar"}

              </div>


              <h1
                className="
                  mt-4
                  text-3xl
                  font-extrabold
                  tracking-tight
                "
              >
                {formatRupiah(
                  transaksi.jumlah
                )}
              </h1>


              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-white/80
                "
              >
                {transaksi.kategori}
              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/15
                bg-white/10
                px-4
                py-3
                text-sm
              "
            >
              <p className="text-white/60">
                Tanggal
              </p>

              <p className="mt-1 font-semibold">
                {formatTanggal(
                  transaksi.tanggal
                )}
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          DETAIL
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

        <div
          className="
            border-b
            border-slate-100
            px-6
            py-5
            sm:px-8
          "
        >

          <h2
            className="
              font-bold
              text-slate-900
            "
          >
            Detail Transaksi
          </h2>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-4
            p-6
            sm:p-8
            md:grid-cols-2
          "
        >

          <DetailItem
            icon={
              isMasuk ? (
                <TrendingUp size={19} />
              ) : (
                <TrendingDown size={19} />
              )
            }
            label="Jenis"
            value={
              isMasuk
                ? "Uang Masuk"
                : "Uang Keluar"
            }
          />


          <DetailItem
            icon={
              <Receipt size={19} />
            }
            label="Kategori"
            value={
              transaksi.kategori
            }
          />


          <DetailItem
            icon={
              <CalendarDays size={19} />
            }
            label="Tanggal"
            value={
              formatTanggal(
                transaksi.tanggal
              )
            }
          />


          <DetailItem
            icon={
              <UserRound size={19} />
            }
            label={
              isMasuk
                ? "Sumber"
                : "Penerima"
            }
            value={
              transaksi.pihak ??
              "-"
            }
          />


          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5
              md:col-span-2
            "
          >

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Keterangan
            </p>


            <p
              className="
                mt-2
                whitespace-pre-wrap
                text-sm
                leading-7
                text-slate-700
              "
            >
              {transaksi.keterangan}
            </p>

          </div>


          {/* REIMBURSE LINK */}

          {transaksi.reimburse && (

            <div
              className="
                rounded-2xl
                border
                border-cyan-100
                bg-cyan-50
                p-5
                md:col-span-2
              "
            >

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-cyan-600
                "
              >
                Sumber Transaksi
              </p>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                Pembayaran reimburse
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Pemohon:{" "}
                {
                  transaksi
                    .reimburse
                    .user.nama
                }
              </p>


              <Link
                href={`/keuangan/reimburse/${transaksi.reimburse.id}`}
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  font-bold
                  text-cyan-700
                  hover:text-cyan-800
                "
              >
                Lihat reimburse

                <ExternalLink
                  size={14}
                />
              </Link>

            </div>

          )}


          {/* BUKTI */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              md:col-span-2
            "
          >

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Bukti Transaksi
            </p>


            {transaksi.buktiUrl ? (

              <a
                href={
                  transaksi.buktiUrl
                }
                target="_blank"
                rel="noreferrer"
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-cyan-600
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-cyan-700
                "
              >
                <ExternalLink
                  size={16}
                />

                Buka Bukti
              </a>

            ) : (

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-400
                "
              >
                Tidak ada bukti transaksi.
              </p>

            )}

          </div>

        </div>


        {/* =================================================
            ACTION
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-slate-100
            bg-slate-50/50
            px-6
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-8
          "
        >

          {transaksi.reimburse ? (

            <div
              className="
                rounded-xl
                border
                border-cyan-100
                bg-cyan-50
                px-4
                py-3
                text-xs
                leading-5
                text-cyan-800
              "
            >
              Transaksi ini dibuat otomatis dari pembayaran reimburse.
              Edit dan hapus dilakukan melalui alur reimburse agar data tetap sinkron.
            </div>

          ) : (

            <div
              className="
                flex
                w-full
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >

              <Link
                href={`/keuangan/transaksi/${transaksi.id}/edit`}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                <Pencil size={16} />

                Edit
              </Link>


              <form
                action={
                  hapusTransaksi
                }
              >
                <input
                  type="hidden"
                  name="id"
                  value={
                    transaksi.id
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
                    bg-red-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-red-700
                    sm:w-auto
                  "
                >
                  <Trash2
                    size={16}
                  />

                  Hapus
                </button>
              </form>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}


// ======================================================
// DETAIL ITEM
// ======================================================

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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


      <div
        className="
          min-w-0
        "
      >

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