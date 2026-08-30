import Link from "next/link";

import {
  ArrowLeft,
  Image,
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
} from "../../components/UserUI";

import UserEditForm from "../../components/UserEditForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPenggunaPage({
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
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7">
      <Link
        href={`/pengguna/${user.id}`}
        className="
          inline-flex items-center gap-2 text-sm font-semibold
          text-slate-500 transition hover:text-cyan-700
        "
      >
        <ArrowLeft size={17} />
        Kembali ke Detail
      </Link>

      <section
        className="
          rounded-3xl border border-slate-200
          bg-white p-5 shadow-sm sm:p-6
        "
      >
        <div
          className="
            flex flex-col gap-5 sm:flex-row
            sm:items-center sm:justify-between
          "
        >
          <div className="flex items-center gap-4">
            <UserAvatar
              url={user.fotoProfil}
              nama={user.nama}
              size="md"
            />

            <div>
              <p
                className="
                  text-xs font-bold uppercase tracking-[0.15em]
                  text-cyan-600
                "
              >
                Edit Pengguna
              </p>
              <h1
                className="
                  mt-1 text-xl font-extrabold
                  text-slate-900 sm:text-2xl
                "
              >
                {user.nama}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge aktif={user.aktif} />
          </div>
        </div>

        <div
          className="
            mt-5 flex items-start gap-2 rounded-2xl
            border border-cyan-100 bg-cyan-50/60
            px-4 py-3 text-xs leading-5 text-cyan-800
          "
        >
          <Image size={16} className="mt-0.5 shrink-0" />
          Foto profil dikelola sendiri oleh pengguna
          melalui menu Profil Saya.
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Pengaturan Akun
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Perbarui identitas, role, status, atau reset password
            pengguna.
          </p>
        </div>

        <UserEditForm
          user={{
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
            aktif: user.aktif,
          }}
        />
      </section>

      <section
        className="
          flex items-start gap-3 rounded-2xl border
          border-amber-200 bg-amber-50 p-4
          text-sm leading-6 text-amber-800
        "
      >
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        Sistem mencegah Superadmin terakhir dinonaktifkan
        atau diturunkan rolenya.
      </section>
    </div>
  );
}
