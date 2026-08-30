"use client";

import Link from "next/link";

import {
  Bell,
  ChevronDown,
  Info,
  Menu,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import type {
  AppRole,
} from "./navigation";


// ======================================================
// TYPES
// ======================================================

type TopbarProps = {
  nama: string;
  role: AppRole;
  onMenuClick: () => void;
};


// ======================================================
// ROLE LABEL
// ======================================================

const ROLE_LABEL: Record<
  AppRole,
  string
> = {
  SUPERADMIN:
    "Superadmin",

  ADMIN_SEKRETARIS:
    "Admin Sekretaris",

  ADMIN_BENDAHARA:
    "Admin Bendahara",

  PENGURUS:
    "Pengurus",

  ANGGOTA:
    "Anggota",
};


// ======================================================
// TOPBAR
// ======================================================

export default function Topbar({
  nama,
  role,
  onMenuClick,
}: TopbarProps) {

  const pathname =
    usePathname();


  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);


  const [
    accountOpen,
    setAccountOpen,
  ] = useState(false);


  const [
    avatarUrl,
    setAvatarUrl,
  ] = useState<
    string | null
  >(
    null
  );


  const notificationRef =
    useRef<HTMLDivElement>(
      null
    );


  const accountRef =
    useRef<HTMLDivElement>(
      null
    );


  // ====================================================
  // CLOSE DROPDOWN
  // ====================================================

  useEffect(() => {

    function handleClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;


      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target
        )
      ) {
        setNotificationOpen(
          false
        );
      }


      if (
        accountRef.current &&
        !accountRef.current.contains(
          target
        )
      ) {
        setAccountOpen(
          false
        );
      }
    }


    document.addEventListener(
      "mousedown",
      handleClick
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );
    };

  }, []);


  // ====================================================
  // AVATAR
  // ====================================================

  useEffect(
    () => {
      let active =
        true;


      async function loadAvatar() {
        try {
          const response =
            await fetch(
              "/api/profile/avatar",
              {
                cache:
                  "no-store",
              }
            );


          if (
            !response.ok
          ) {
            return;
          }


          const result =
            await response.json() as {
              fotoProfil?:
                string | null;
            };


          if (
            active
          ) {
            setAvatarUrl(
              result.fotoProfil ??
              null
            );
          }

        } catch {
          // Fallback ke icon default.
        }
      }


      function handleAvatarUpdated(
        event: Event
      ) {
        const customEvent =
          event as CustomEvent<{
            fotoProfil?:
              string | null;
          }>;


        setAvatarUrl(
          customEvent.detail
            ?.fotoProfil ??
          null
        );
      }


      loadAvatar();


      window.addEventListener(
        "kamoo:avatar-updated",
        handleAvatarUpdated
      );


      return () => {
        active =
          false;


        window.removeEventListener(
          "kamoo:avatar-updated",
          handleAvatarUpdated
        );
      };
    },
    []
  );


  // ====================================================
  // PAGE INFO
  // ====================================================

  function getPageInfo() {

    // --------------------------------------------------
    // SURAT MASUK
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/surat/masuk"
      )
    ) {
      return {
        title:
          "Surat Masuk",

        subtitle:
          "Kelola surat yang diterima organisasi",
      };
    }


    // --------------------------------------------------
    // SURAT KELUAR
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/surat/keluar"
      )
    ) {
      return {
        title:
          "Surat Keluar",

        subtitle:
          "Kelola penerbitan surat organisasi",
      };
    }


    // --------------------------------------------------
    // PENGAJUAN SURAT
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/surat/pengajuan"
      )
    ) {
      return {
        title:
          "Pengajuan Surat",

        subtitle:
          "Kelola kebutuhan administrasi surat",
      };
    }


    // --------------------------------------------------
    // APPROVAL SURAT
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/approval"
      )
    ) {
      return {
        title:
          "Approval Surat",

        subtitle:
          "Review dan persetujuan administrasi",
      };
    }


    // ==================================================
    // KEUANGAN
    // ==================================================

    // --------------------------------------------------
    // UANG MASUK
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/keuangan/masuk"
      )
    ) {
      return {
        title:
          "Uang Masuk",

        subtitle:
          "Catatan pemasukan organisasi",
      };
    }


    // --------------------------------------------------
    // UANG KELUAR
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/keuangan/keluar"
      )
    ) {
      return {
        title:
          "Uang Keluar",

        subtitle:
          "Catatan pengeluaran organisasi",
      };
    }


    // --------------------------------------------------
    // REIMBURSE
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/keuangan/reimburse"
      )
    ) {
      return {
        title:
          "Reimburse",

        subtitle:
          "Pengajuan dan verifikasi penggantian biaya",
      };
    }


    // --------------------------------------------------
    // LAPORAN KEUANGAN
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/keuangan/laporan"
      )
    ) {
      return {
        title:
          "Laporan Keuangan",

        subtitle:
          "Rekap dan laporan keuangan organisasi",
      };
    }


    // --------------------------------------------------
    // DETAIL / TRANSAKSI / KEUANGAN UMUM
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/keuangan"
      )
    ) {
      return {
        title:
          "Keuangan",

        subtitle:
          "Monitoring keuangan organisasi",
      };
    }


    // --------------------------------------------------
    // JADWAL
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/jadwal"
      )
    ) {
      return {
        title:
          "Jadwal",

        subtitle:
          "Agenda kegiatan organisasi",
      };
    }


    // --------------------------------------------------
    // DOKUMEN
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/dokumen"
      )
    ) {
      return {
        title:
          "Dokumen",

        subtitle:
          "Arsip dokumen organisasi",
      };
    }


    // --------------------------------------------------
    // PROFIL
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/profil"
      )
    ) {
      return {
        title:
          "Profil Saya",

        subtitle:
          "Kelola identitas dan foto profil",
      };
    }


    // --------------------------------------------------
    // PENGGUNA
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/pengguna"
      )
    ) {
      return {
        title:
          "Pengguna",

        subtitle:
          "Manajemen akun dan akses",
      };
    }


    // --------------------------------------------------
    // PENGATURAN
    // --------------------------------------------------

    if (
      pathname.startsWith(
        "/pengaturan"
      )
    ) {
      return {
        title:
          "Pengaturan",

        subtitle:
          "Konfigurasi sistem KAMOO",
      };
    }


    // --------------------------------------------------
    // DEFAULT
    // --------------------------------------------------

    return {
      title:
        "Dashboard",

      subtitle:
        "Ringkasan aktivitas organisasi",
    };
  }


  const page =
    getPageInfo();


  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-slate-200/80
        bg-white/85
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          min-h-[72px]
          items-center
          justify-between
          gap-3
          px-4
          sm:gap-4
          sm:px-5
          md:px-7
          lg:px-8
        "
      >

        {/* =================================================
            LEFT
        ================================================= */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          {/* MOBILE MENU */}

          <button
            type="button"
            aria-label="Buka menu"
            onClick={
              onMenuClick
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              transition
              hover:border-cyan-200
              hover:bg-cyan-50
              hover:text-cyan-700
              lg:hidden
            "
          >
            <Menu
              size={20}
            />
          </button>


          {/* PAGE TITLE */}

          <div
            className="
              min-w-0
            "
          >

            <h1
              className="
                truncate
                text-base
                font-bold
                tracking-tight
                text-slate-900
                sm:text-lg
              "
            >
              {page.title}
            </h1>


            <p
              className="
                hidden
                truncate
                text-xs
                text-slate-500
                sm:block
                md:text-sm
              "
            >
              {page.subtitle}
            </p>

          </div>

        </div>


        {/* =================================================
            RIGHT
        ================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            sm:gap-3
          "
        >

          {/* =================================================
              NOTIFICATION
          ================================================= */}

          <div
            ref={
              notificationRef
            }
            className="
              relative
            "
          >

            <button
              type="button"
              aria-label="Notifikasi"
              aria-expanded={
                notificationOpen
              }
              onClick={() => {

                setNotificationOpen(
                  (
                    current
                  ) =>
                    !current
                );


                setAccountOpen(
                  false
                );

              }}
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                shadow-sm
                transition
                hover:border-cyan-200
                hover:bg-cyan-50
                hover:text-cyan-700
              "
            >
              <Bell
                size={18}
              />

            </button>


            {notificationOpen && (

              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+10px)]
                  z-50
                  w-[calc(100vw-2rem)]
                  max-w-[340px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                "
              >

                <div
                  className="
                    border-b
                    border-slate-100
                    px-5
                    py-4
                  "
                >

                  <p
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Notifikasi
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Informasi terbaru
                    dari KAMOO
                  </p>

                </div>


                <div
                  className="
                    px-5
                    py-8
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-cyan-50
                      text-cyan-600
                    "
                  >
                    <Bell
                      size={19}
                    />
                  </div>


                  <p
                    className="
                      mt-3
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Belum ada notifikasi
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-400
                    "
                  >
                    Notifikasi aktivitas
                    organisasi akan muncul
                    di sini.
                  </p>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              ACCOUNT
          ================================================= */}

          <div
            ref={
              accountRef
            }
            className="
              relative
            "
          >

            <button
              type="button"
              aria-label="Menu akun"
              aria-expanded={
                accountOpen
              }
              onClick={() => {

                setAccountOpen(
                  (
                    current
                  ) =>
                    !current
                );


                setNotificationOpen(
                  false
                );

              }}
              className="
                flex
                items-center
                gap-2.5
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-2
                py-1.5
                text-left
                shadow-sm
                transition
                hover:border-cyan-200
                hover:bg-cyan-50/40
                sm:pr-3
              "
            >

              {/* AVATAR */}

              <ProfileAvatar
                url={
                  avatarUrl
                }
                nama={
                  nama
                }
                size="sm"
              />


              {/* NAME */}

              <div
                className="
                  hidden
                  min-w-0
                  sm:block
                "
              >

                <p
                  className="
                    max-w-[140px]
                    truncate
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  {nama}
                </p>


                <p
                  className="
                    truncate
                    text-[11px]
                    text-slate-500
                  "
                >
                  {
                    ROLE_LABEL[
                      role
                    ]
                  }
                </p>

              </div>


              {/* CHEVRON */}

              <ChevronDown
                size={15}
                className={`
                  hidden
                  text-slate-400
                  transition
                  sm:block

                  ${
                    accountOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {accountOpen && (

              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+10px)]
                  z-50
                  w-[min(260px,calc(100vw-2rem))]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                "
              >

                {/* ACCOUNT HEADER */}

                <div
                  className="
                    px-5
                    py-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <ProfileAvatar
                      url={
                        avatarUrl
                      }
                      nama={
                        nama
                      }
                      size="md"
                    />


                    <div
                      className="
                        min-w-0
                      "
                    >

                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-slate-900
                        "
                      >
                        {nama}
                      </p>


                      <p
                        className="
                          mt-0.5
                          truncate
                          text-xs
                          text-slate-500
                        "
                      >
                        {
                          ROLE_LABEL[
                            role
                          ]
                        }
                      </p>

                    </div>

                  </div>

                </div>


                {/* PROFILE ACTION */}

                <div
                  className="
                    border-t
                    border-slate-100
                    bg-slate-50/70
                    p-3
                  "
                >
                  <Link
                    href="/profil"
                    onClick={() => {
                      setAccountOpen(
                        false
                      );
                    }}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      text-slate-700
                      transition
                      hover:bg-white
                      hover:text-cyan-700
                    "
                  >
                    <UserRound
                      size={17}
                      className="
                        text-cyan-600
                      "
                    />

                    Profil Saya
                  </Link>


                  <div
                    className="
                      mt-1
                      flex
                      items-start
                      gap-2
                      px-3
                      py-2
                      text-xs
                      leading-5
                      text-slate-400
                    "
                  >
                    <Info
                      size={14}
                      className="
                        mt-0.5
                        shrink-0
                      "
                    />

                    <span>
                      Foto profil dapat
                      diubah oleh pemilik
                      akun.
                    </span>
                  </div>
                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>
  );
}

// ======================================================
// PROFILE AVATAR
// ======================================================

function ProfileAvatar({
  url,
  nama,
  size,
}: {
  url:
    string | null;

  nama:
    string;

  size:
    "sm" |
    "md";
}) {
  const sizeClass =
    size === "sm"
      ? "h-9 w-9"
      : "h-11 w-11";


  const iconSize =
    size === "sm"
      ? 18
      : 20;


  return (
    <div
      className={`
        flex
        ${sizeClass}
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        bg-gradient-to-br
        from-teal-600
        to-cyan-500
        text-white
      `}
    >
      {url ? (
        <img
          src={
            url
          }
          alt={
            `Foto profil ${nama}`
          }
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        <UserRound
          size={
            iconSize
          }
        />
      )}
    </div>
  );
}

