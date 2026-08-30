import {
  FileText,
  Wallet,
  CalendarDays,
  Clock3,
} from "lucide-react";

const activities = [
  {
    title: "Pengajuan surat baru",
    description: "Permohonan administrasi organisasi",
    status: "Menunggu",
    time: "Baru saja",
    icon: FileText,
  },

  {
    title: "Reimburse kegiatan",
    description: "Pengajuan biaya operasional",
    status: "Diproses",
    time: "2 jam lalu",
    icon: Wallet,
  },

  {
    title: "Agenda organisasi",
    description: "Jadwal kegiatan terbaru",
    status: "Terjadwal",
    time: "Hari ini",
    icon: CalendarDays,
  },
];

export default function Activity() {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Aktivitas Terbaru
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Ringkasan aktivitas sistem organisasi
        </p>
      </div>

      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        {activities.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`
                flex
                items-start
                gap-4
                p-5
                transition
                hover:bg-cyan-50/40

                ${
                  index !== activities.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }
              `}
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-50
                  text-cyan-600
                "
              >
                <Icon size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="
                    flex
                    flex-col
                    gap-1
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <h3 className="font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <span
                    className="
                      w-fit
                      rounded-full
                      bg-cyan-50
                      px-2.5
                      py-1
                      text-xs
                      font-medium
                      text-cyan-700
                    "
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {item.description}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock3 size={13} />

                  {item.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}