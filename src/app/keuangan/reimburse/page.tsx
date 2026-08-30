import Link from "next/link";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Plus,
  Receipt,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import type {
  StatusReimburse,
} from "@prisma/client";


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
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }
  );
}


// ======================================================
// STATUS
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
      "Menunggu",

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
// PAGE
// ======================================================

export default async function ReimbursePage() {
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


  const reimburse =
    await prisma.reimburse.findMany({
      where:
        isBendahara
          ? undefined
          : {
              userId:
                String(
                  session.id
                ),
            },

      include: {
        user: true,
        keuangan: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });


  const totalPengajuan =
    reimburse.length;


  const totalMenunggu =
    reimburse.filter(
      (item) =>
        item.status ===
        "MENUNGGU"
    ).length;


  const totalDisetujui =
    reimburse.filter(
      (item) =>
        item.status ===
        "DISETUJUI"
    ).length;


  const totalDibayar =
    reimburse.filter(
      (item) =>
        item.status ===
        "DIBAYAR"
    ).length;


  return (
    <div
      className="
        mx-auto
        max-w-7xl
        space-y-7
      "
    >

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

        <div>

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
            Reimburse
          </h1>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            {isBendahara
              ? "Kelola seluruh pengajuan penggantian biaya organisasi."
              : "Ajukan dan pantau penggantian biaya milik kamu."}
          </p>

        </div>


        <Link
          href="/keuangan/reimburse/tambah"
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
          <Plus size={17} />

          Ajukan Reimburse
        </Link>

      </section>


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section
        className="
          grid
          grid-cols-2
          gap-4
          lg:grid-cols-4
        "
      >

        <SummaryCard
          icon={
            <Receipt size={19} />
          }
          label="Total Pengajuan"
          value={totalPengajuan}
          tone="cyan"
        />


        <SummaryCard
          icon={
            <Clock3 size={19} />
          }
          label="Menunggu"
          value={totalMenunggu}
          tone="amber"
        />


        <SummaryCard
          icon={
            <CheckCircle2
              size={19}
            />
          }
          label="Disetujui"
          value={totalDisetujui}
          tone="blue"
        />


        <SummaryCard
          icon={
            <CheckCircle2
              size={19}
            />
          }
          label="Dibayar"
          value={totalDibayar}
          tone="green"
        />

      </section>


      {/* ==================================================
          TABLE
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
            flex
            items-center
            gap-3
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-6
          "
        >

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
            {isBendahara ? (
              <Users size={19} />
            ) : (
              <Receipt size={19} />
            )}
          </div>


          <div>

            <h2
              className="
                font-bold
                text-slate-900
              "
            >
              {isBendahara
                ? "Daftar Pengajuan Reimburse"
                : "Riwayat Reimburse Saya"}
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {isBendahara
                ? "Seluruh pengajuan penggantian biaya organisasi."
                : "Seluruh pengajuan reimbursement akun kamu."}
            </p>

          </div>

        </div>


        {reimburse.length === 0 ? (

          <div
            className="
              flex
              min-h-[320px]
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
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-cyan-50
                text-cyan-600
              "
            >
              <Receipt size={24} />
            </div>


            <p
              className="
                mt-4
                font-semibold
                text-slate-800
              "
            >
              Belum ada pengajuan reimburse
            </p>


            <p
              className="
                mt-1
                max-w-sm
                text-sm
                leading-6
                text-slate-500
              "
            >
              Pengajuan reimbursement akan
              muncul di halaman ini.
            </p>

          </div>

        ) : (

          <>

            {/* ============================================
                DESKTOP
            ============================================ */}

            <div
              className="
                hidden
                overflow-x-auto
                md:block
              "
            >

              <table className="w-full">

                <thead
                  className="
                    bg-slate-50
                  "
                >

                  <tr>

                    {isBendahara && (
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Pemohon
                      </th>
                    )}

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Keterangan
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Jumlah
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Aksi
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {reimburse.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="
                          border-t
                          border-slate-100
                          transition
                          hover:bg-slate-50
                        "
                      >

                        {isBendahara && (
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {item.user.nama}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {item.user.email}
                            </p>
                          </td>
                        )}


                        <td
                          className="
                            max-w-[320px]
                            px-6
                            py-4
                          "
                        >

                          <p
                            className="
                              line-clamp-2
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >
                            {item.keterangan}
                          </p>

                        </td>


                        <td
                          className="
                            whitespace-nowrap
                            px-6
                            py-4
                            text-sm
                            font-bold
                            text-slate-900
                          "
                        >
                          {formatRupiah(
                            item.jumlah
                          )}
                        </td>


                        <td
                          className="
                            whitespace-nowrap
                            px-6
                            py-4
                            text-sm
                            text-slate-500
                          "
                        >
                          {formatTanggal(
                            item.createdAt
                          )}
                        </td>


                        <td className="px-6 py-4">

                          <StatusBadge
                            status={
                              item.status
                            }
                          />

                        </td>


                        <td
                          className="
                            px-6
                            py-4
                            text-right
                          "
                        >

                          <Link
                            href={`/keuangan/reimburse/${item.id}`}
                            className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-xl
                              border
                              border-slate-200
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-slate-700
                              transition
                              hover:border-cyan-200
                              hover:bg-cyan-50
                              hover:text-cyan-700
                            "
                          >
                            Detail

                            <ArrowUpRight
                              size={14}
                            />
                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* ============================================
                MOBILE
            ============================================ */}

            <div
              className="
                divide-y
                divide-slate-100
                md:hidden
              "
            >

              {reimburse.map(
                (item) => (

                  <Link
                    key={item.id}
                    href={`/keuangan/reimburse/${item.id}`}
                    className="
                      block
                      p-5
                      transition
                      hover:bg-slate-50
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >

                        <StatusBadge
                          status={
                            item.status
                          }
                        />


                        <span
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          {formatTanggal(
                            item.createdAt
                          )}
                        </span>

                      </div>


                      <ArrowUpRight
                        size={16}
                        className="
                          shrink-0
                          text-slate-300
                        "
                      />

                    </div>


                    {isBendahara && (

                      <div className="mt-4">

                        <p
                          className="
                            text-xs
                            font-semibold
                            text-cyan-700
                          "
                        >
                          {item.user.nama}
                        </p>


                        <p
                          className="
                            mt-0.5
                            text-[11px]
                            text-slate-400
                          "
                        >
                          {item.user.email}
                        </p>

                      </div>

                    )}


                    <p
                      className="
                        mt-3
                        text-sm
                        font-semibold
                        leading-6
                        text-slate-800
                      "
                    >
                      {item.keterangan}
                    </p>


                    <p
                      className="
                        mt-3
                        text-lg
                        font-extrabold
                        text-slate-900
                      "
                    >
                      {formatRupiah(
                        item.jumlah
                      )}
                    </p>

                  </Link>
                )
              )}

            </div>

          </>
        )}

      </section>

    </div>
  );
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone:
    | "cyan"
    | "amber"
    | "blue"
    | "green";
}) {
  const styles = {
    cyan: {
      icon:
        "bg-cyan-50 text-cyan-600",
      value:
        "text-slate-900",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
    },

    blue: {
      icon:
        "bg-blue-50 text-blue-600",
      value:
        "text-blue-700",
    },

    green: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-emerald-700",
    },
  };


  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${styles[tone].icon}
        `}
      >
        {icon}
      </div>


      <p
        className="
          mt-4
          text-xs
          font-medium
          text-slate-500
          sm:text-sm
        "
      >
        {label}
      </p>


      <p
        className={`
          mt-1
          text-2xl
          font-extrabold
          ${styles[tone].value}
        `}
      >
        {value}
      </p>

    </div>
  );
}