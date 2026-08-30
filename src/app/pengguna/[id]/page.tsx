import Link from "next/link";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  FileText,
  FolderOpen,
  Mail,
  Pencil,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  RoleBadge,
  StatusBadge,
  UserAvatar,
} from "../components/UserUI";

import UserStatusAction from "../components/UserStatusAction";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DetailPenggunaPage({
  params,
}: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (String(session.role) !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      aktif: true,
      fotoProfil: true,
      createdAt: true,
      updatedAt: true,

      loker: {
        select: {
          id: true,
          _count: {
            select: {
              folders: true,
              files: true,
            },
          },
        },
      },

      _count: {
        select: {
          pengajuanSurat: true,
          reimburse: true,
          approvals: true,
          audit: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const recentActivity = await prisma.auditLog.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <Link
        href="/pengguna"
        className="
          inline-flex items-center gap-2 text-sm font-semibold
          text-slate-500 transition hover:text-cyan-700
        "
      >
        <ArrowLeft size={17} />
        Kembali ke Pengguna
      </Link>

      <section
        className="
          relative overflow-hidden rounded-[30px]
          bg-gradient-to-br from-teal-600 via-cyan-600
          to-cyan-500 text-white shadow-xl shadow-cyan-100
        "
      >
        <div
          className="
            pointer-events-none absolute -right-20 -top-20
            h-64 w-64 rounded-full bg-white/10
          "
        />

        <div
          className="
            relative flex flex-col gap-6 p-6 sm:p-8
            md:flex-row md:items-center md:justify-between
          "
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <UserAvatar
              url={user.fotoProfil}
              nama={user.nama}
              size="lg"
            />

            <div>
              <p
                className="
                  text-xs font-bold uppercase tracking-[0.16em]
                  text-white/60
                "
              >
                Profil Pengguna
              </p>

              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                {user.nama}
              </h1>

              <p
                className="
                  mt-2 flex items-center gap-2 text-sm text-white/70
                "
              >
                <Mail size={15} />
                {user.email}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge aktif={user.aktif} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/pengguna/${user.id}/edit`}
              className="
                inline-flex items-center gap-2 rounded-xl
                bg-white px-4 py-2.5 text-sm font-bold
                text-cyan-700 shadow-sm
              "
            >
              <Pencil size={16} />
              Edit
            </Link>

            <UserStatusAction
              userId={user.id}
              nama={user.nama}
              aktif={user.aktif}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<FileText size={19} />}
          label="Pengajuan Surat"
          value={user._count.pengajuanSurat}
          tone="cyan"
        />

        <SummaryCard
          icon={<ReceiptText size={19} />}
          label="Reimburse"
          value={user._count.reimburse}
          tone="amber"
        />

        <SummaryCard
          icon={<ShieldCheck size={19} />}
          label="Approval"
          value={user._count.approvals}
          tone="violet"
        />

        <SummaryCard
          icon={<FolderOpen size={19} />}
          label="File Loker"
          value={user.loker ? user.loker._count.files : 0}
          tone="emerald"
        />
      </section>

      <section
        className="
          grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]
        "
      >
        <div
          className="
            rounded-3xl border border-slate-200
            bg-white p-5 shadow-sm sm:p-6
          "
        >
          <h2 className="font-bold text-slate-900">
            Informasi Akun
          </h2>

          <div className="mt-5 space-y-4">
            <InfoRow
              icon={<CalendarDays size={17} />}
              label="Tanggal Daftar"
              value={formatDateTime(user.createdAt)}
            />

            <InfoRow
              icon={<Activity size={17} />}
              label="Terakhir Diperbarui"
              value={formatDateTime(user.updatedAt)}
            />

            <InfoRow
              icon={<FolderOpen size={17} />}
              label="Loker"
              value={
                user.loker
                  ? `${user.loker._count.folders} folder • ${user.loker._count.files} file`
                  : "Belum dibuat"
              }
            />
          </div>
        </div>

        <div
          className="
            overflow-hidden rounded-3xl border border-slate-200
            bg-white shadow-sm
          "
        >
          <div
            className="
              border-b border-slate-100 px-5 py-5 sm:px-6
            "
          >
            <h2 className="font-bold text-slate-900">
              Aktivitas Terbaru
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Jejak aktivitas pengguna di KAMOO.
            </p>
          </div>

          {recentActivity.length === 0 ? (
            <div
              className="
                px-6 py-10 text-center text-sm text-slate-400
              "
            >
              Belum ada aktivitas tercatat.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-4 sm:px-6"
                >
                  <p className="text-sm font-semibold text-slate-700">
                    {item.aktivitas}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "cyan" | "amber" | "violet" | "emerald";
}) {
  const styles = {
    cyan: "bg-cyan-50 text-cyan-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div
      className="
        rounded-2xl border border-slate-200
        bg-white p-4 shadow-sm sm:p-5
      "
    >
      <div
        className={`
          flex h-10 w-10 items-center justify-center
          rounded-xl ${styles[tone]}
        `}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
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
        flex items-start gap-3 rounded-2xl bg-slate-50 p-4
      "
    >
      <div className="mt-0.5 text-cyan-600">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}
