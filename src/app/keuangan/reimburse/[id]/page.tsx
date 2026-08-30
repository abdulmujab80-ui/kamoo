import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Receipt,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  prisma,
} from "@/lib/prisma";

import {
  getSession,
} from "@/lib/auth";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  revalidatePath,
} from "next/cache";

import type {
  StatusReimburse,
} from "@prisma/client";


// ======================================================
// PAGE PROPS
// ======================================================

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// FORMAT RUPIAH
// ======================================================

function formatRupiah(
  value: number
) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(
  value: Date
) {
  return value.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }
  );
}


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}: {
  status: StatusReimburse;
}) {
  const styles: Record<
    StatusReimburse,
    string
  > = {
    MENUNGGU:
      "border-amber-200 bg-amber-50 text-amber-700",

    DISETUJUI:
      "border-cyan-200 bg-cyan-50 text-cyan-700",

    DITOLAK:
      "border-red-200 bg-red-50 text-red-700",

    DIBAYAR:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };


  const labels: Record<
    StatusReimburse,
    string
  > = {
    MENUNGGU:
      "Menunggu Review",

    DISETUJUI:
      "Disetujui",

    DITOLAK:
      "Ditolak",

    DIBAYAR:
      "Dibayar",
  };


  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-bold
        ${styles[status]}
      `}
    >
      {labels[status]}
    </span>
  );
}


// ======================================================
// PROSES REIMBURSE
// ======================================================

async function prosesReimburse(
  formData: FormData
) {
  "use server";


  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  const isBendahara =
    session.role ===
      "SUPERADMIN" ||
    session.role ===
      "ADMIN_BENDAHARA";


  if (!isBendahara) {
    redirect("/dashboard");
  }


  const id =
    String(
      formData.get("id") ?? ""
    ).trim();


  const action =
    String(
      formData.get(
        "action"
      ) ?? ""
    ).trim();


  const catatan =
    String(
      formData.get(
        "catatan"
      ) ?? ""
    ).trim();


  if (!id) {
    throw new Error(
      "ID reimburse tidak ditemukan."
    );
  }


  const reimburse =
    await prisma.reimburse.findUnique({
      where: {
        id,
      },

      include: {
        user: true,
        keuangan: true,
      },
    });


  if (!reimburse) {
    throw new Error(
      "Pengajuan reimburse tidak ditemukan."
    );
  }


  // ====================================================
  // TOLAK
  // ====================================================

  if (
    action ===
    "TOLAK"
  ) {
    if (
      reimburse.status !==
      "MENUNGGU"
    ) {
      throw new Error(
        "Reimburse ini sudah tidak menunggu review."
      );
    }


    if (!catatan) {
      throw new Error(
        "Alasan penolakan wajib diisi."
      );
    }


    await prisma.$transaction(
      async (tx) => {

        await tx.reimburse.update({
          where: {
            id,
          },

          data: {
            status:
              "DITOLAK",

            catatan,
          },
        });


        await tx.approval.create({
          data: {
            modul:
              "REIMBURSE",

            dataId:
              id,

            status:
              "DITOLAK",

            catatan,

            userId:
              String(
                session.id
              ),
          },
        });


        await tx.auditLog.create({
          data: {
            userId:
              String(
                session.id
              ),

            aktivitas:
              `Menolak reimburse ${reimburse.id} ` +
              `milik ${reimburse.user.nama}`,
          },
        });

      }
    );
  }


  // ====================================================
  // SETUJUI
  // ====================================================

  else if (
    action ===
    "SETUJUI"
  ) {
    if (
      reimburse.status !==
      "MENUNGGU"
    ) {
      throw new Error(
        "Reimburse ini sudah diproses."
      );
    }


    await prisma.$transaction(
      async (tx) => {

        await tx.reimburse.update({
          where: {
            id,
          },

          data: {
            status:
              "DISETUJUI",

            catatan:
              catatan ||
              null,
          },
        });


        await tx.approval.create({
          data: {
            modul:
              "REIMBURSE",

            dataId:
              id,

            status:
              "DISETUJUI",

            catatan:
              catatan ||
              "Reimburse disetujui.",

            userId:
              String(
                session.id
              ),
          },
        });


        await tx.auditLog.create({
          data: {
            userId:
              String(
                session.id
              ),

            aktivitas:
              `Menyetujui reimburse ${reimburse.id} ` +
              `milik ${reimburse.user.nama}`,
          },
        });

      }
    );
  }


  // ====================================================
  // BAYAR
  // ====================================================

  else if (
    action ===
    "BAYAR"
  ) {
    if (
      reimburse.status !==
      "DISETUJUI"
    ) {
      throw new Error(
        "Reimburse harus disetujui sebelum dibayar."
      );
    }


    if (
      reimburse.keuangan
    ) {
      throw new Error(
        "Reimburse ini sudah memiliki transaksi keuangan."
      );
    }


    await prisma.$transaction(
      async (tx) => {

        await tx.keuangan.create({
          data: {
            jenis:
              "KELUAR",

            kategori:
              "Reimburse",

            keterangan:
              `Reimburse ${reimburse.user.nama} - ${reimburse.keterangan}`,

            pihak:
              reimburse.user.nama,

            jumlah:
              reimburse.jumlah,

            tanggal:
              new Date(),

            buktiUrl:
              reimburse.buktiUrl,

            reimburseId:
              reimburse.id,
          },
        });


        await tx.reimburse.update({
          where: {
            id,
          },

          data: {
            status:
              "DIBAYAR",

            catatan:
              catatan ||
              "Reimburse telah dibayarkan.",
          },
        });


        await tx.auditLog.create({
          data: {
            userId:
              String(
                session.id
              ),

            aktivitas:
              `Membayar reimburse ${reimburse.id} ` +
              `sebesar Rp${reimburse.jumlah.toLocaleString(
                "id-ID"
              )} ` +
              `untuk ${reimburse.user.nama}`,
          },
        });

      }
    );
  }


  else {
    throw new Error(
      "Aksi reimburse tidak valid."
    );
  }


  // ====================================================
  // REVALIDATE
  // ====================================================

  revalidatePath(
    "/keuangan/reimburse"
  );


  revalidatePath(
    `/keuangan/reimburse/${id}`
  );


  revalidatePath(
    "/keuangan"
  );


  revalidatePath(
    "/keuangan/keluar"
  );


  revalidatePath(
    "/keuangan/laporan"
  );
}


// ======================================================
// PAGE
// ======================================================

export default async function DetailReimburse({
  params,
}: PageProps) {
  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  const {
    id,
  } = await params;


  if (!id) {
    notFound();
  }


  const reimburse =
    await prisma.reimburse.findUnique({
      where: {
        id,
      },

      include: {
        user: true,
        keuangan: true,
      },
    });


  if (!reimburse) {
    notFound();
  }


  const isBendahara =
    session.role ===
      "SUPERADMIN" ||
    session.role ===
      "ADMIN_BENDAHARA";


  const isOwner =
    String(
      session.id
    ) ===
    reimburse.userId;


  /*
   * User biasa hanya boleh melihat
   * reimburse miliknya sendiri.
   */
  if (
    !isBendahara &&
    !isOwner
  ) {
    redirect(
      "/keuangan/reimburse"
    );
  }


  return (
    <div
      className="
        mx-auto
        max-w-5xl
        space-y-6
      "
    >

      {/* ==================================================
          BACK
      ================================================== */}

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


      {/* ==================================================
          HEADER
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
            bg-gradient-to-r
            from-teal-600
            to-cyan-500
            px-6
            py-7
            text-white
            sm:px-8
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-white/80
                "
              >
                Detail Reimburse
              </p>


              <h1
                className="
                  mt-2
                  text-2xl
                  font-extrabold
                  tracking-tight
                  sm:text-3xl
                "
              >
                {formatRupiah(
                  reimburse.jumlah
                )}
              </h1>


              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/80
                "
              >
                Pengajuan oleh{" "}
                {reimburse.user.nama}
              </p>

            </div>


            <StatusBadge
              status={
                reimburse.status
              }
            />

          </div>

        </div>


        {/* DETAIL */}

        <div
          className="
            space-y-5
            p-6
            sm:p-8
          "
        >

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >

            <InfoCard
              icon={
                <Building2
                  size={19}
                />
              }
              label="Pemohon"
              value={
                reimburse.user.nama
              }
              secondary={
                reimburse.user.email
              }
            />


            <InfoCard
              icon={
                <CalendarDays
                  size={19}
                />
              }
              label="Tanggal Pengajuan"
              value={
                formatTanggal(
                  reimburse.createdAt
                )
              }
            />


            <InfoCard
              icon={
                <WalletCards
                  size={19}
                />
              }
              label="Jumlah"
              value={
                formatRupiah(
                  reimburse.jumlah
                )
              }
            />


            <InfoCard
              icon={
                <Receipt
                  size={19}
                />
              }
              label="Status"
              value={
                reimburse.status
              }
            />

          </div>


          {/* KETERANGAN */}

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5
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
              {reimburse.keterangan}
            </p>

          </div>


          {/* CATATAN */}

          {reimburse.catatan && (

            <div
              className="
                rounded-2xl
                border
                border-amber-200
                bg-amber-50
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

                <AlertCircle
                  size={19}
                  className="
                    mt-0.5
                    shrink-0
                    text-amber-600
                  "
                />


                <div>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-amber-800
                    "
                  >
                    Catatan Bendahara
                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-amber-700
                    "
                  >
                    {reimburse.catatan}
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* BUKTI */}

          {reimburse.buktiUrl ? (

            <div
              className="
                rounded-2xl
                border
                border-cyan-100
                bg-cyan-50
                p-5
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
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
                    "
                  >
                    <FileText
                      size={19}
                    />
                  </div>


                  <div>

                    <p
                      className="
                        font-bold
                        text-slate-900
                      "
                    >
                      Bukti Transaksi
                    </p>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Dokumen pendukung reimburse.
                    </p>

                  </div>

                </div>


                <a
                  href={
                    reimburse.buktiUrl
                  }
                  target="_blank"
                  rel="noreferrer"
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
                  <ExternalLink
                    size={17}
                  />

                  Lihat Bukti
                </a>

              </div>

            </div>

          ) : (

            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-slate-50
                p-5
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                Belum ada bukti transaksi
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Pemohon tidak menyertakan tautan
                bukti saat pengajuan.
              </p>

            </div>

          )}


          {/* TRANSAKSI HASIL PEMBAYARAN */}

          {reimburse.keuangan && (

            <div
              className="
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
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
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-emerald-600
                  "
                >
                  <CheckCircle2
                    size={19}
                  />
                </div>


                <div>

                  <p
                    className="
                      font-bold
                      text-emerald-800
                    "
                  >
                    Pembayaran tercatat
                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-emerald-700
                    "
                  >
                    Reimburse ini sudah tercatat
                    sebagai transaksi uang keluar.
                  </p>


                  <p
                    className="
                      mt-2
                      text-xs
                      font-semibold
                      text-emerald-600
                    "
                  >
                    Transaksi:{" "}
                    {reimburse.keuangan.id}
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

      </section>


      {/* ==================================================
          BENDAHARA ACTION
      ================================================== */}

      {isBendahara &&
        reimburse.status ===
          "MENUNGGU" && (

          <section
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
              sm:p-7
            "
          >

            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Review Pengajuan
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Periksa nominal dan bukti sebelum
                menyetujui atau menolak pengajuan.
              </p>

            </div>


            <div
              className="
                mt-5
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >

              {/* SETUJUI */}

              <form
                action={
                  prosesReimburse
                }
                className="
                  rounded-2xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  p-5
                "
              >

                <input
                  type="hidden"
                  name="id"
                  value={
                    reimburse.id
                  }
                />


                <input
                  type="hidden"
                  name="action"
                  value="SETUJUI"
                />


                <label
                  htmlFor="catatan-setujui"
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Catatan Persetujuan
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


                <textarea
                  id="catatan-setujui"
                  name="catatan"
                  rows={3}
                  placeholder="Catatan bendahara..."
                  className="
                    mt-2
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-emerald-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-900
                    outline-none
                    focus:border-emerald-400
                    focus:ring-4
                    focus:ring-emerald-50
                  "
                />


                <button
                  type="submit"
                  className="
                    mt-3
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-emerald-700
                  "
                >
                  <CheckCircle2
                    size={17}
                  />

                  Setujui Reimburse
                </button>

              </form>


              {/* TOLAK */}

              <form
                action={
                  prosesReimburse
                }
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-5
                "
              >

                <input
                  type="hidden"
                  name="id"
                  value={
                    reimburse.id
                  }
                />


                <input
                  type="hidden"
                  name="action"
                  value="TOLAK"
                />


                <label
                  htmlFor="catatan-tolak"
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Alasan Penolakan

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
                  id="catatan-tolak"
                  name="catatan"
                  required
                  rows={3}
                  placeholder="Jelaskan apa yang perlu diperbaiki atau alasan penolakan..."
                  className="
                    mt-2
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-red-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-900
                    outline-none
                    focus:border-red-400
                    focus:ring-4
                    focus:ring-red-50
                  "
                />


                <button
                  type="submit"
                  className="
                    mt-3
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
                  "
                >
                  <XCircle
                    size={17}
                  />

                  Tolak Reimburse
                </button>

              </form>

            </div>

          </section>
        )}


      {/* ==================================================
          PAYMENT
      ================================================== */}

      {isBendahara &&
        reimburse.status ===
          "DISETUJUI" && (
          <section
            className="
              rounded-3xl
              border
              border-emerald-200
              bg-emerald-50
              p-6
              shadow-sm
              sm:p-7
            "
          >

            <div
              className="
                flex
                flex-col
                gap-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    font-bold
                    text-emerald-800
                  "
                >
                  Reimburse siap dibayarkan
                </p>


                <p
                  className="
                    mt-1
                    max-w-2xl
                    text-sm
                    leading-6
                    text-emerald-700
                  "
                >
                  Setelah dibayarkan, sistem akan
                  otomatis membuat transaksi Uang
                  Keluar dan mengurangi saldo organisasi.
                </p>

              </div>


              <form
                action={
                  prosesReimburse
                }
              >

                <input
                  type="hidden"
                  name="id"
                  value={
                    reimburse.id
                  }
                />


                <input
                  type="hidden"
                  name="action"
                  value="BAYAR"
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
                    bg-emerald-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                    sm:w-auto
                  "
                >
                  <WalletCards
                    size={17}
                  />

                  Tandai Sudah Dibayar
                </button>

              </form>

            </div>

          </section>
        )}

    </div>
  );
}


// ======================================================
// INFO CARD
// ======================================================

function InfoCard({
  icon,
  label,
  value,
  secondary,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;

  secondary?: string;
}) {
  return (
    <div
      className="
        flex
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
            font-medium
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


        {secondary && (

          <p
            className="
              mt-0.5
              break-all
              text-xs
              text-slate-400
            "
          >
            {secondary}
          </p>

        )}

      </div>

    </div>
  );
}