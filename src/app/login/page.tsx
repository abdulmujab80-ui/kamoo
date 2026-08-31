"use client";

import Image from "next/image";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { login } from "./action";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main
      className="
        relative
        min-h-dvh
        overflow-hidden
        bg-gradient-to-br
        from-[#effbfd]
        via-white
        to-[#e9f8f5]
        px-4
        py-6
        sm:px-6
        md:flex
        md:items-center
        md:justify-center
        md:py-10
      "
    >
      {/* BACKGROUND DECORATION */}
      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-cyan-200/30
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-28
          -left-24
          h-72
          w-72
          rounded-full
          bg-teal-200/30
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          flex
          w-full
          max-w-5xl
          flex-col
        "
      >
        {/* =====================================================
            BRAND MOBILE
        ===================================================== */}
        <div
          className="
            mb-6
            flex
            flex-col
            items-center
            text-center
            md:hidden
          "
        >
          <div
            className="
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <Image
              src="/logokati.png"
              alt="Logo KATI"
              width={48}
              height={48}
              priority
              className="
                h-11
                w-11
                shrink-0
                object-contain
              "
            />

            <h1
              className="
                text-[30px]
                font-black
                leading-none
                tracking-[-0.04em]
                text-slate-900
              "
            >
              KAMOO
            </h1>
          </div>

          <p
            className="
              mt-3
              max-w-[300px]
              text-[13px]
              font-medium
              leading-5
              text-slate-500
            "
          >
            KATI Manajemen Operasional Organisasi
          </p>
        </div>

        {/* =====================================================
            MAIN LOGIN CARD
        ===================================================== */}
        <section
          className="
            grid
            w-full
            overflow-hidden
            rounded-[28px]
            bg-white
            shadow-[0_20px_60px_rgba(15,23,42,0.10)]
            md:grid-cols-2
            md:rounded-[32px]
          "
        >
          {/* ===================================================
              LEFT DESKTOP BRAND
          =================================================== */}
          <div
            className="
              relative
              hidden
              min-h-[610px]
              overflow-hidden
              bg-gradient-to-br
              from-[#0f766e]
              via-[#0d9488]
              to-[#0891b2]
              p-10
              text-white
              md:flex
              md:flex-col
              md:justify-between
              lg:p-12
            "
          >
            {/* BACKGROUND SHAPES */}
            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-64
                w-64
                rounded-full
                bg-white/10
                blur-sm
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-28
                -left-20
                h-72
                w-72
                rounded-full
                bg-cyan-300/10
              "
            />

            {/* BRAND */}
            <div className="relative z-10">
              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >
                <Image
                  src="/logokati.png"
                  alt="Logo KATI"
                  width={56}
                  height={56}
                  priority
                  className="
                    h-[52px]
                    w-[52px]
                    shrink-0
                    object-contain
                  "
                />

                <h1
                  className="
                    text-4xl
                    font-black
                    leading-none
                    tracking-[-0.04em]
                    text-white
                  "
                >
                  KAMOO
                </h1>
              </div>

              <p
                className="
                  mt-5
                  max-w-sm
                  text-[15px]
                  font-medium
                  leading-6
                  text-white/80
                "
              >
                KATI Manajemen Operasional Organisasi
              </p>

              <p
                className="
                  mt-3
                  max-w-sm
                  text-sm
                  leading-6
                  text-white/60
                "
              >
                Satu ruang kerja untuk administrasi, keuangan,
                agenda, dokumen, dan aktivitas organisasi.
              </p>
            </div>

            {/* QUOTE */}
            <div
              className="
                relative
                z-10
                rounded-3xl
                bg-white/10
                p-6
                backdrop-blur-md
              "
            >
              <p
                className="
                  text-lg
                  font-semibold
                  leading-8
                  text-white
                "
              >
                “Organisasi yang tertata, membangun progress
                yang lebih baik.”
              </p>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  text-white/65
                "
              >
                <ShieldCheck size={15} />

                <span>
                  Sistem operasional internal KATI
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              RIGHT LOGIN FORM
          =================================================== */}
          <div
            className="
              flex
              flex-col
              justify-center
              px-5
              py-7
              sm:px-8
              sm:py-9
              md:px-10
              md:py-12
              lg:px-12
            "
          >
            {/* FORM HEADER */}
            <div>
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-cyan-600
                "
              >
                Selamat Datang
              </p>

              <h2
                className="
                  mt-2
                  text-[26px]
                  font-extrabold
                  leading-tight
                  tracking-[-0.03em]
                  text-slate-900
                  sm:text-3xl
                "
              >
                Masuk ke akun KAMOO
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Gunakan akun organisasi untuk melanjutkan.
              </p>
            </div>

            {/* FORM */}
            <form
              action={login}
              className="
                mt-7
                space-y-5
              "
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="
                      h-[52px]
                      w-full
                      rounded-[14px]
                      bg-slate-100/80
                      pl-11
                      pr-4
                      text-sm
                      font-medium
                      text-slate-800
                      outline-none
                      transition-all
                      duration-200
                      placeholder:font-normal
                      placeholder:text-slate-400
                      focus:bg-white
                      focus:ring-2
                      focus:ring-cyan-400/70
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className="
                      h-[52px]
                      w-full
                      rounded-[14px]
                      bg-slate-100/80
                      pl-11
                      pr-12
                      text-sm
                      font-medium
                      text-slate-800
                      outline-none
                      transition-all
                      duration-200
                      placeholder:font-normal
                      placeholder:text-slate-400
                      focus:bg-white
                      focus:ring-2
                      focus:ring-cyan-400/70
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      flex
                      h-9
                      w-9
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-slate-200/70
                      hover:text-slate-700
                    "
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={18}
                        strokeWidth={1.8}
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-gradient-to-r
                  from-teal-600
                  to-cyan-600
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_10px_25px_rgba(8,145,178,0.20)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_30px_rgba(8,145,178,0.28)]
                  active:translate-y-0
                "
              >
                Masuk
              </button>

              {/* SECURITY INFO */}
              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  pt-1
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                <ShieldCheck
                  size={14}
                  className="text-cyan-500"
                />

                <span>
                  Sistem internal organisasi
                </span>
              </div>
            </form>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <footer
          className="
            py-5
            text-center
            text-[11px]
            font-semibold
            tracking-wide
            text-slate-400
          "
        >
          KAMOO v1.0
        </footer>
      </div>
    </main>
  );
}