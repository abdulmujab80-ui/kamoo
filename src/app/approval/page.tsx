import Link from "next/link";

import {
  ClipboardCheck,
  Clock3,
  UserRound,
  FileText,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import {
  requireSekretaris,
} from "@/lib/permissions";

import {
  mulaiProses,
  setujuiPengajuan,
  tolakPengajuan,
} from "./actions";


function StatusBadge({
  status,
}: {
  status: string;
}) {

  const style: Record<string, string> = {
    DIAJUKAN:
      "bg-amber-50 text-amber-700 border-amber-200",

    DIPROSES:
      "bg-cyan-50 text-cyan-700 border-cyan-200",

    DISETUJUI:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    DITOLAK:
      "bg-red-50 text-red-700 border-red-200",
  };


  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${style[status] ?? "bg-slate-50 text-slate-600 border-slate-200"}
      `}
    >
      {status}
    </span>
  );
}



export default async function ApprovalPage() {

  await requireSekretaris();


  const data =
    await prisma.pengajuanSurat.findMany({

      where: {
        status: {
          in: [
            "DIAJUKAN",
            "DIPROSES",
            "DISETUJUI",
          ],
        },
      },

      include: {
        user: true,
        suratKeluar: true,
      },

      orderBy: {
        createdAt: "desc",
      },

    });


  const menunggu =
    data.filter(
      (item) =>
        item.status === "DIAJUKAN"
    ).length;


  const diproses =
    data.filter(
      (item) =>
        item.status === "DIPROSES"
    ).length;


  const disetujui =
    data.filter(
      (item) =>
        item.status === "DISETUJUI"
    ).length;


  return (
    <div className="space-y-8">

      {/* HEADER */}

      <section>

        <p className="text-sm font-medium text-cyan-600">
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
          Approval Surat
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review dan proses pengajuan administrasi organisasi.
        </p>

      </section>


      {/* SUMMARY */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
      >

        <SummaryCard
          icon={<Clock3 size={20} />}
          label="Menunggu Review"
          value={menunggu}
        />

        <SummaryCard
          icon={<ClipboardCheck size={20} />}
          label="Sedang Diproses"
          value={diproses}
        />

        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label="Siap Diterbitkan"
          value={disetujui}
        />

      </section>


      {/* LIST */}

      <section>

        <div className="mb-5">

          <h2 className="text-xl font-bold text-slate-900">
            Daftar Pengajuan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pengajuan yang membutuhkan tindak lanjut sekretaris.
          </p>

        </div>


        {data.length === 0 ? (

          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              px-6
              py-14
              text-center
              shadow-sm
            "
          >

            <div
              className="
                mx-auto
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
              <ClipboardCheck size={24} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Tidak ada pengajuan
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Semua pengajuan sudah ditindaklanjuti.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {data.map((item) => (

              <article
                key={item.id}
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  sm:p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    gap-5
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                  "
                >

                  {/* INFO */}

                  <div className="min-w-0 flex-1">

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >

                      <StatusBadge
                        status={item.status}
                      />

                      <span className="text-xs text-slate-400">
                        {item.createdAt.toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>

                    </div>


                    <h3
                      className="
                        mt-4
                        text-lg
                        font-bold
                        text-slate-900
                      "
                    >
                      {item.jenis}
                    </h3>


                    <div
                      className="
                        mt-4
                        grid
                        grid-cols-1
                        gap-3
                        sm:grid-cols-2
                      "
                    >

                      <Info
                        icon={<UserRound size={16} />}
                        label="Pemohon"
                        value={item.user.nama}
                      />

                      <Info
                        icon={<FileText size={16} />}
                        label="Tujuan"
                        value={item.tujuan}
                      />

                    </div>


                    <div
                      className="
                        mt-4
                        rounded-2xl
                        bg-slate-50
                        p-4
                      "
                    >

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Keperluan
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-slate-700">
                        {item.keperluan}
                      </p>

                    </div>

                  </div>


                  {/* ACTION */}

                  <div
                    className="
                      flex
                      w-full
                      flex-col
                      gap-2
                      lg:w-[230px]
                    "
                  >

                    <Link
                      href={`/surat/${item.id}`}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                      "
                    >
                      Lihat Detail
                      <ArrowUpRight size={16} />
                    </Link>


                    {item.status === "DIAJUKAN" && (

                      <form action={mulaiProses}>

                        <input
                          type="hidden"
                          name="id"
                          value={item.id}
                        />

                        <button
                          className="
                            w-full
                            rounded-xl
                            bg-cyan-600
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-cyan-700
                          "
                        >
                          Mulai Proses
                        </button>

                      </form>

                    )}


                    {item.status === "DIPROSES" && (

                      <>

                        <form
                          action={setujuiPengajuan}
                          className="space-y-2"
                        >

                          <input
                            type="hidden"
                            name="id"
                            value={item.id}
                          />

                          <input
                            name="catatan"
                            placeholder="Catatan approval (opsional)"
                            className="
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                              px-3
                              py-2.5
                              text-sm
                              text-slate-900
                              outline-none
                              focus:border-cyan-400
                            "
                          />

                          <button
                            className="
                              w-full
                              rounded-xl
                              bg-emerald-600
                              px-4
                              py-2.5
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-emerald-700
                            "
                          >
                            Setujui
                          </button>

                        </form>


                        <form
                          action={tolakPengajuan}
                          className="space-y-2"
                        >

                          <input
                            type="hidden"
                            name="id"
                            value={item.id}
                          />

                          <input
                            name="catatan"
                            required
                            placeholder="Alasan penolakan"
                            className="
                              w-full
                              rounded-xl
                              border
                              border-red-200
                              bg-red-50
                              px-3
                              py-2.5
                              text-sm
                              text-slate-900
                              outline-none
                            "
                          />

                          <button
                            className="
                              w-full
                              rounded-xl
                              border
                              border-red-200
                              bg-white
                              px-4
                              py-2.5
                              text-sm
                              font-semibold
                              text-red-600
                              transition
                              hover:bg-red-50
                            "
                          >
                            Tolak
                          </button>

                        </form>

                      </>

                    )}


                    {item.status === "DISETUJUI" && (

                      item.suratKeluar ? (

                        <Link
                          href={`/surat/keluar/${item.suratKeluar.id}`}
                          className="
                            flex
                            items-center
                            justify-center
                            rounded-xl
                            bg-emerald-50
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-emerald-700
                          "
                        >
                          Lihat Surat Keluar
                        </Link>

                      ) : (

                        <div
                          className="
                            rounded-xl
                            bg-amber-50
                            px-4
                            py-3
                            text-center
                            text-xs
                            font-medium
                            text-amber-700
                          "
                        >
                          Siap diterbitkan
                        </div>

                      )

                    )}

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}



function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
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
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-extrabold text-slate-900">
        {value}
      </p>

    </div>
  );
}



function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {

  return (
    <div className="flex items-start gap-2">

      <div className="mt-0.5 text-slate-400">
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="text-sm font-medium text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}