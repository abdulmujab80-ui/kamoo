import {
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireAuth,
} from "@/lib/permissions";

import AvatarUploader from "./AvatarUploader";


const ROLE_LABEL:
  Record<
    string,
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
// PROFILE PAGE
// ======================================================

export default async function ProfilePage() {
  const session =
    await requireAuth();


  const userId =
    String(
      session.id
    );


  const user =
    await prisma.user.findUnique({
      where: {
        id:
          userId,
      },

      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        fotoProfil: true,
      },
    });


  if (!user) {
    notFound();
  }


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-4xl
        space-y-7
      "
    >
      {/* HEADER */}

      <section>
        <p
          className="
            text-sm
            font-bold
            text-cyan-600
          "
        >
          Akun Saya
        </p>


        <h1
          className="
            mt-1
            text-2xl
            font-extrabold
            tracking-tight
            text-slate-900
            sm:text-3xl
          "
        >
          Profil Saya
        </h1>


        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Kelola foto profil yang tampil
          pada akun KAMOO Anda.
        </p>
      </section>


      {/* AVATAR */}

      <AvatarUploader
        nama={
          user.nama
        }
        initialUrl={
          user.fotoProfil
        }
      />


      {/* ACCOUNT INFO */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-6
          "
        >
          <h2
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            Informasi Akun
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Data identitas akun dikelola
            oleh sistem KAMOO.
          </p>
        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-3
            p-5
            sm:grid-cols-2
            sm:p-6
          "
        >
          <InfoCard
            icon={
              <UserRound
                size={19}
              />
            }
            label="Nama"
            value={
              user.nama
            }
          />


          <InfoCard
            icon={
              <Mail
                size={19}
              />
            }
            label="Email"
            value={
              user.email
            }
          />


          <InfoCard
            icon={
              <ShieldCheck
                size={19}
              />
            }
            label="Role"
            value={
              ROLE_LABEL[
                String(
                  user.role
                )
              ] ??
              String(
                user.role
              )
            }
          />
        </div>
      </section>
    </div>
  );
}


// ======================================================
// INFO CARD
// ======================================================

function InfoCard({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-slate-50/60
        p-4
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-cyan-50
          text-cyan-600
        "
      >
        {icon}
      </div>


      <div className="min-w-0">
        <p
          className="
            text-xs
            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            truncate
            text-sm
            font-bold
            text-slate-800
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}
