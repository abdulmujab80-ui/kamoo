import Link from "next/link";
import {
  Archive,
  FileText,
  FolderOpen,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireSekretaris } from "@/lib/permissions";


function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style: Record<string, string> = {
    DRAFT:
      "border-slate-200 bg-slate-50 text-slate-600",

    DIAJUKAN:
      "border-amber-200 bg-amber-50 text-amber-700",

    DIPROSES:
      "border-cyan-200 bg-cyan-50 text-cyan-700",

    DISETUJUI:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    DITOLAK:
      "border-red-200 bg-red-50 text-red-700",

    SELESAI:
      "border-purple-200 bg-purple-50 text-purple-700",
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
        font-semibold
        ${style[status] ?? style.DRAFT}
      `}
    >
      {status}
    </span>
  );
}


export default async function SuratMasukPage() {
  /*
   * Surat Masuk hanya boleh diakses:
   * - SUPERADMIN
   * - ADMIN_SEKRETARIS
   */
  const user = await requireSekretaris();


  const [surat, total] = await Promise.all([
    prisma.suratMasuk.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.suratMasuk.count(),
  ]);


  return (
    <div className="space-y-7">

      {/* HEADER */}

      <section
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
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
            Surat Masuk
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Arsip dan pengelolaan surat masuk organisasi KAMOO.
          </p>
        </div>


        <Link
          href="/surat/masuk/tambah"
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
          <Plus size={18} />

          Tambah Surat
        </Link>
      </section>


      {/* SUMMARY */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        <SummaryCard
          icon={<FileText size={20} />}
          label="Total Surat Masuk"
          value={String(total)}
        />

        <SummaryCard
          icon={<Archive size={20} />}
          label="Status Arsip"
          value="Aktif"
        />

        <SummaryCard
          icon={<ShieldCheck size={20} />}
          label="Akses"
          value={String(user.role)}
        />
      </section>


      {/* TABLE CARD */}

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
            <FolderOpen size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Daftar Surat Masuk
            </h2>

            <p className="text-sm text-slate-500">
              Seluruh surat masuk yang telah tercatat.
            </p>
          </div>
        </div>


        {/* DESKTOP TABLE */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th
                  className="
                    px-5
                    py-4
                    text-left
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Nomor Surat
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-left
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Asal
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-left
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Perihal
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-left
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Tanggal
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-left
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Status
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-right
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Aksi
                </th>
              </tr>
            </thead>


            <tbody>
              {surat.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-6
                      py-14
                      text-center
                      text-sm
                      text-slate-400
                    "
                  >
                    Belum ada surat masuk.
                  </td>
                </tr>
              ) : (
                surat.map((item) => (
                  <tr
                    key={item.id}
                    className="
                      border-t
                      border-slate-100
                      transition
                      hover:bg-slate-50/70
                    "
                  >
                    <td
                      className="
                        px-5
                        py-4
                        text-sm
                        font-semibold
                        text-slate-800
                      "
                    >
                      {item.nomorSurat}
                    </td>

                    <td
                      className="
                        px-5
                        py-4
                        text-sm
                        text-slate-600
                      "
                    >
                      {item.asal}
                    </td>

                    <td
                      className="
                        max-w-xs
                        px-5
                        py-4
                        text-sm
                        text-slate-600
                      "
                    >
                      {item.perihal}
                    </td>

                    <td
                      className="
                        whitespace-nowrap
                        px-5
                        py-4
                        text-sm
                        text-slate-500
                      "
                    >
                      {item.tanggalSurat.toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={item.status}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div
                        className="
                          flex
                          justify-end
                          gap-2
                        "
                      >
                        <Link
                          href={`/surat/masuk/${item.id}`}
                          className="
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-700
                            transition
                            hover:bg-slate-50
                          "
                        >
                          Detail
                        </Link>


                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="
                              rounded-lg
                              bg-cyan-50
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-cyan-700
                              transition
                              hover:bg-cyan-100
                            "
                          >
                            File
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {/* MOBILE */}

        <div className="divide-y divide-slate-100 md:hidden">
          {surat.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-50
                  text-cyan-600
                "
              >
                <FileText size={21} />
              </div>

              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Belum ada surat masuk
              </p>
            </div>
          ) : (
            surat.map((item) => (
              <article
                key={item.id}
                className="p-5"
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        break-words
                        text-sm
                        font-bold
                        text-slate-900
                      "
                    >
                      {item.nomorSurat}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      {item.tanggalSurat.toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <StatusBadge
                    status={item.status}
                  />
                </div>


                <div className="mt-4 space-y-3">
                  <div>
                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Asal
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      {item.asal}
                    </p>
                  </div>


                  <div>
                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Perihal
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-700
                      "
                    >
                      {item.perihal}
                    </p>
                  </div>
                </div>


                <div
                  className="
                    mt-5
                    flex
                    gap-2
                  "
                >
                  <Link
                    href={`/surat/masuk/${item.id}`}
                    className="
                      flex-1
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-2.5
                      text-center
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Detail
                  </Link>


                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        flex-1
                        rounded-xl
                        bg-cyan-50
                        px-4
                        py-2.5
                        text-center
                        text-sm
                        font-semibold
                        text-cyan-700
                      "
                    >
                      File
                    </a>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
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
  value: string;
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

      <p
        className="
          mt-1
          break-words
          text-xl
          font-extrabold
          text-slate-900
        "
      >
        {value}
      </p>
    </div>
  );
}