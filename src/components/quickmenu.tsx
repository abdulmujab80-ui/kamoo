import Link from "next/link";

import {
  FilePlus2,
  WalletCards,
  CalendarDays,
  FileSearch,
  ArrowUpRight,
} from "lucide-react";

const menus = [
  {
    title: "Ajukan Surat",
    description: "Buat permohonan administrasi baru",
    href: "/surat/pengajuan",
    icon: FilePlus2,
  },

  {
    title: "Ajukan Reimburse",
    description: "Ajukan penggantian biaya kegiatan",
    href: "/keuangan/reimburse",
    icon: WalletCards,
  },

  {
    title: "Jadwal Kegiatan",
    description: "Lihat agenda organisasi terbaru",
    href: "/jadwal",
    icon: CalendarDays,
  },

  {
    title: "Status Surat",
    description: "Pantau proses pengajuan surat",
    href: "/surat",
    icon: FileSearch,
  },
];

export default function QuickMenu() {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Menu Cepat
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Akses fitur utama organisasi
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                group
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-cyan-200
                hover:shadow-xl
                hover:shadow-cyan-100/60
              "
            >
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-cyan-500
                    to-teal-500
                    text-white
                    shadow-md
                  "
                >
                  <Icon size={20} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="
                    text-slate-300
                    transition
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-cyan-600
                  "
                />
              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}