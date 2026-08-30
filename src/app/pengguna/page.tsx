import Link from "next/link";

import {
  ArrowUpRight,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

import type {
  Prisma,
  Role,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import {
  RoleBadge,
  StatusBadge,
  UserAvatar,
} from "./components/UserUI";

import UserStatusAction from "./components/UserStatusAction";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
  }>;
};

const ROLES: Role[] = [
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
  "ADMIN_BENDAHARA",
  "PENGURUS",
  "ANGGOTA",
];

export default async function PenggunaPage({
  searchParams,
}: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (String(session.role) !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const q = String(params.q ?? "").trim();

  const role = ROLES.includes(params.role as Role)
    ? (params.role as Role)
    : null;

  const status =
    params.status === "aktif" ||
    params.status === "nonaktif"
      ? params.status
      : null;

  const where: Prisma.UserWhereInput = {};

  if (q) {
    where.OR = [
      {
        nama: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.aktif = status === "aktif";
  }

  const [
    users,
    totalUser,
    totalAktif,
    totalNonaktif,
    roleGroups,
  ] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        aktif: true,
        fotoProfil: true,
        createdAt: true,
      },
      orderBy: [
        { aktif: "desc" },
        { nama: "asc" },
      ],
    }),

    prisma.user.count(),

    prisma.user.count({
      where: { aktif: true },
    }),

    prisma.user.count({
      where: { aktif: false },
    }),

    prisma.user.groupBy({
      by: ["role"],
    }),
  ]);

  return (
    <div
      className="
        mx-auto w-full max-w-[1500px]
        space-y-6 sm:space-y-7
      "
    >
      <section
        className="
          flex flex-col gap-4
          sm:flex-row sm:items-end sm:justify-between
        "
      >
        <div>
          <p className="text-sm font-bold text-cyan-600">
            Administrasi Akun
          </p>

          <h1
            className="
              mt-1 text-2xl font-extrabold tracking-tight
              text-slate-900 sm:text-3xl
            "
          >
            Manajemen Pengguna
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Kelola akun, role, dan status akses pengguna KAMOO.
          </p>
        </div>

        <Link
          href="/pengguna/tambah"
          className="
            inline-flex w-fit items-center justify-center gap-2
            rounded-xl bg-cyan-600 px-5 py-3 text-sm
            font-bold text-white shadow-sm transition
            hover:bg-cyan-700
          "
        >
          <UserPlus size={18} />
          Tambah Pengguna
        </Link>
      </section>

      <section
        className="
          grid grid-cols-2 gap-3 lg:grid-cols-4
        "
      >
        <StatCard
          icon={<Users size={20} />}
          label="Total Pengguna"
          value={totalUser}
          helper="Semua akun"
          tone="cyan"
        />

        <StatCard
          icon={<UserCheck size={20} />}
          label="Akun Aktif"
          value={totalAktif}
          helper="Dapat digunakan"
          tone="emerald"
        />

        <StatCard
          icon={<UserX size={20} />}
          label="Nonaktif"
          value={totalNonaktif}
          helper="Akses dihentikan"
          tone="slate"
        />

        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Role Terpakai"
          value={roleGroups.length}
          helper="Jenis akses"
          tone="violet"
        />
      </section>

      <section
        className="
          rounded-3xl border border-slate-200
          bg-white p-4 shadow-sm sm:p-5
        "
      >
        <form
          action="/pengguna"
          method="get"
          className="
            grid grid-cols-1 gap-3
            md:grid-cols-[1fr_220px_180px_auto]
          "
        >
          <div className="relative">
            <Search
              size={17}
              className="
                pointer-events-none absolute left-4 top-1/2
                -translate-y-1/2 text-slate-400
              "
            />

            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau email..."
              className="
                w-full rounded-xl border border-slate-200
                bg-slate-50 py-3 pl-11 pr-4 text-sm
                outline-none transition
                focus:border-cyan-400 focus:bg-white
                focus:ring-4 focus:ring-cyan-50
              "
            />
          </div>

          <select
            name="role"
            defaultValue={role ?? ""}
            className={filterClass}
          >
            <option value="">Semua Role</option>
            <option value="SUPERADMIN">Superadmin</option>
            <option value="ADMIN_SEKRETARIS">
              Admin Sekretaris
            </option>
            <option value="ADMIN_BENDAHARA">
              Admin Bendahara
            </option>
            <option value="PENGURUS">Pengurus</option>
            <option value="ANGGOTA">Anggota</option>
          </select>

          <select
            name="status"
            defaultValue={status ?? ""}
            className={filterClass}
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          <button
            type="submit"
            className="
              rounded-xl bg-slate-900 px-5 py-3
              text-sm font-bold text-white transition
              hover:bg-slate-800
            "
          >
            Terapkan
          </button>
        </form>
      </section>

      <section
        className="
          overflow-hidden rounded-3xl border border-slate-200
          bg-white shadow-sm
        "
      >
        <div
          className="
            flex items-center justify-between gap-4
            border-b border-slate-100 px-5 py-5 sm:px-6
          "
        >
          <div>
            <h2 className="font-bold text-slate-900">
              Daftar Pengguna
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {users.length} akun sesuai filter
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <div
            className="
              flex min-h-[260px] flex-col items-center
              justify-center px-6 py-12 text-center
            "
          >
            <div
              className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl bg-cyan-50 text-cyan-600
              "
            >
              <Users size={24} />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Pengguna tidak ditemukan
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Ubah kata pencarian atau filter.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr
                    className="
                      text-left text-xs font-bold uppercase
                      tracking-wide text-slate-400
                    "
                  >
                    <th className="px-6 py-4">Pengguna</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Terdaftar</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="
                        transition hover:bg-cyan-50/30
                      "
                    >
                      <td className="px-6 py-4">
                        <div
                          className="
                            flex min-w-[240px] items-center gap-3
                          "
                        >
                          <UserAvatar
                            url={user.fotoProfil}
                            nama={user.nama}
                            size="sm"
                          />

                          <div className="min-w-0">
                            <p
                              className="
                                truncate text-sm font-bold
                                text-slate-800
                              "
                            >
                              {user.nama}
                            </p>
                            <p
                              className="
                                mt-0.5 truncate text-xs text-slate-500
                              "
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge aktif={user.aktif} />
                      </td>

                      <td
                        className="
                          whitespace-nowrap px-4 py-4
                          text-sm text-slate-500
                        "
                      >
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <div
                          className="
                            flex items-center justify-end gap-2
                          "
                        >
                          <Link
                            href={`/pengguna/${user.id}`}
                            className="
                              inline-flex h-10 items-center gap-1.5
                              rounded-xl border border-slate-200 px-3
                              text-xs font-bold text-slate-700 transition
                              hover:border-cyan-200 hover:bg-cyan-50
                              hover:text-cyan-700
                            "
                          >
                            Detail
                            <ArrowUpRight size={14} />
                          </Link>

                          <Link
                            href={`/pengguna/${user.id}/edit`}
                            className="
                              inline-flex h-10 items-center rounded-xl
                              bg-cyan-600 px-3 text-xs font-bold
                              text-white transition hover:bg-cyan-700
                            "
                          >
                            Edit
                          </Link>

                          <UserStatusAction
                            userId={user.id}
                            nama={user.nama}
                            aktif={user.aktif}
                            compact
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {users.map((user) => (
                <article key={user.id} className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      url={user.fotoProfil}
                      nama={user.nama}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">
                        {user.nama}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {user.email}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <RoleBadge role={user.role} />
                        <StatusBadge aktif={user.aktif} />
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      flex items-center justify-between gap-3
                      border-t border-slate-100 pt-4
                    "
                  >
                    <span className="text-xs text-slate-400">
                      {formatDate(user.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/pengguna/${user.id}`}
                        className="
                          rounded-xl border border-slate-200
                          px-3 py-2 text-xs font-bold text-slate-700
                        "
                      >
                        Detail
                      </Link>

                      <Link
                        href={`/pengguna/${user.id}/edit`}
                        className="
                          rounded-xl bg-cyan-600 px-3 py-2
                          text-xs font-bold text-white
                        "
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

const filterClass = `
  w-full rounded-xl border border-slate-200 bg-slate-50
  px-4 py-3 text-sm text-slate-700 outline-none transition
  focus:border-cyan-400 focus:bg-white focus:ring-4
  focus:ring-cyan-50
`;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function StatCard({
  icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
  tone: "cyan" | "emerald" | "slate" | "violet";
}) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-500",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div
      className="
        rounded-2xl border border-slate-200 bg-white
        p-4 shadow-sm sm:p-5
      "
    >
      <div
        className={`
          flex h-10 w-10 items-center justify-center
          rounded-xl ${tones[tone]}
        `}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500 sm:text-sm">
        {label}
      </p>
      <p
        className="
          mt-1 text-2xl font-extrabold tracking-tight
          text-slate-900 sm:text-3xl
        "
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
        {helper}
      </p>
    </div>
  );
}
