"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Save,
} from "lucide-react";

import type { Role } from "@prisma/client";

import {
  useActionState,
  useState,
} from "react";

import {
  updateUser,
  type UserFormState,
} from "../actions";

const initialState: UserFormState = {
  error: null,
};

export default function UserEditForm({
  user,
}: {
  user: {
    id: string;
    nama: string;
    email: string;
    role: Role;
    aktif: boolean;
  };
}) {
  const [state, formAction, pending] =
    useActionState(updateUser, initialState);

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
      <input type="hidden" name="id" value={user.id} />

      <div className="space-y-6 p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="Nama Lengkap"
            name="nama"
            defaultValue={user.nama}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            defaultValue={user.email}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="role" className={labelClass}>
              Role
            </label>

            <select
              id="role"
              name="role"
              defaultValue={user.role}
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
          </div>

          <div>
            <label htmlFor="aktif" className={labelClass}>
              Status Akun
            </label>

            <select
              id="aktif"
              name="aktif"
              defaultValue={String(user.aktif)}
              className={inputClass}
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
        </div>

        <div
          className="
            rounded-2xl border border-slate-200
            bg-slate-50/70 p-4 sm:p-5
          "
        >
          <div>
            <h3 className="font-bold text-slate-900">
              Reset Password
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Kosongkan kedua field jika password tidak ingin diubah.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newPassword"
                className={labelClass}
              >
                Password Baru
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
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
                    hover:bg-white hover:text-slate-700
                  "
                  aria-label="Tampilkan password baru"
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
                minLength={8}
                autoComplete="new-password"
                placeholder="Ulangi password baru"
                className={inputClass}
              />
            </div>
          </div>
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

          {pending ? "Menyimpan..." : "Simpan Perubahan"}
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

function FormField({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required
        defaultValue={defaultValue}
        className={inputClass}
      />
    </div>
  );
}
