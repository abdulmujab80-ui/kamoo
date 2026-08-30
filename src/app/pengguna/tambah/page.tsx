import Link from "next/link";

import {
  ArrowLeft,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import UserCreateForm from "../components/UserCreateForm";

export default async function TambahPenggunaPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (String(session.role) !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7">
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
          relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-teal-600 via-cyan-600
          to-cyan-500 p-6 text-white shadow-xl
          shadow-cyan-100 sm:p-8
        "
      >
        <div
          className="
            pointer-events-none absolute -right-16 -top-16
            h-52 w-52 rounded-full bg-white/10
          "
        />

        <div className="relative">
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-2xl bg-white/15
            "
          >
            <UserPlus size={21} />
          </div>

          <h1
            className="
              mt-5 text-2xl font-extrabold tracking-tight
              sm:text-3xl
            "
          >
            Tambah Pengguna
          </h1>

          <p
            className="
              mt-2 max-w-2xl text-sm leading-6 text-white/75
            "
          >
            Buat akun baru dan tentukan role sesuai tanggung jawab
            di organisasi.
          </p>

          <div
            className="
              mt-5 inline-flex items-center gap-2 rounded-full
              bg-white/10 px-3 py-1.5 text-xs font-semibold
            "
          >
            <ShieldCheck size={14} />
            Hanya Superadmin
          </div>
        </div>
      </section>

      <UserCreateForm />
    </div>
  );
}
