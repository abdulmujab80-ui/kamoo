"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useActionState,
  useState,
} from "react";

import {
  createUser,
  type UserFormState,
} from "../actions";

const initialState: UserFormState = {
  error: null,
};

export default function UserCreateForm() {
  const [state, formAction, pending] =
    useActionState(createUser, initialState);

  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <form
      action={formAction}
      className="
        overflow-hidden rounded-3xl border border-slate-200
        bg-white shadow-sm
      "
    >
      <div className="space-y-6 p-5 sm:p-7">
        <Field
          label="Nama Lengkap"
          htmlFor="nama"
          icon={<UserRound size={18} />}
        >
          <input
            id="nama"
            name="nama"
            required
            minLength={2}
            autoComplete="name"
            placeholder="Nama pengguna"
            className={inputClass}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="email"
          icon={<Mail size={18} />}
        >
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@organisasi.id"
            className={inputClass}
          />
        </Field>

        <Field
          label="Role"
          htmlFor="role"
          icon={<ShieldCheck size={18} />}
        >
          <select
            id="role"
            name="role"
            defaultValue="ANGGOTA"
            className={inputClass}
          >
            <option value="SUPERADMIN">
              Superadmin
            </option>
            <option value="ADMIN_SEKRETARIS">
              Admin Sekretaris
            </option>
            <option value="ADMIN_BENDAHARA">
              Admin Bendahara
            </option>
            <option value="PENGURUS">
              Pengurus
            </option>
            <option value="ANGGOTA">
              Anggota
            </option>
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() => {
                  setShowPassword((current) => !current);
                }}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  rounded-lg p-2 text-slate-400
                  hover:bg-slate-100 hover:text-slate-700
                "
                aria-label="Tampilkan password"
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className={labelClass}
            >
              Konfirmasi Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Ulangi password"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="aktif" className={labelClass}>
            Status Akun
          </label>

          <select
            id="aktif"
            name="aktif"
            defaultValue="true"
            className={inputClass}
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Akun nonaktif tetap tersimpan, tetapi akses operasional
            dinonaktifkan.
          </p>
        </div>

        {state.error && (
          <div
            className="
              rounded-2xl border border-rose-200 bg-rose-50
              px-4 py-3 text-sm text-rose-700
            "
          >
            {state.error}
          </div>
        )}
      </div>

      <div
        className="
          flex justify-end border-t border-slate-100
          bg-slate-50/60 px-5 py-4 sm:px-7
        "
      >
        <button
          type="submit"
          disabled={pending}
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl bg-cyan-600 px-5 py-3 text-sm
            font-bold text-white shadow-sm transition
            hover:bg-cyan-700 disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {pending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {pending ? "Menyimpan..." : "Simpan Pengguna"}
        </button>
      </div>
    </form>
  );
}

const labelClass = `
  mb-2 block text-sm font-semibold text-slate-700
`;

const inputClass = `
  w-full rounded-xl border border-slate-200 bg-slate-50
  px-4 py-3 text-sm text-slate-900 outline-none transition
  placeholder:text-slate-400 focus:border-cyan-400
  focus:bg-white focus:ring-4 focus:ring-cyan-50
`;

function Field({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="
          mb-2 flex items-center gap-2 text-sm
          font-semibold text-slate-700
        "
      >
        <span className="text-cyan-600">
          {icon}
        </span>
        {label}
      </label>

      {children}
    </div>
  );
}
