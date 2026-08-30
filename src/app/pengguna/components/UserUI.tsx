import { UserRound } from "lucide-react";
import type { Role } from "@prisma/client";

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN_SEKRETARIS: "Admin Sekretaris",
  ADMIN_BENDAHARA: "Admin Bendahara",
  PENGURUS: "Pengurus",
  ANGGOTA: "Anggota",
};

const ROLE_STYLE: Record<Role, string> = {
  SUPERADMIN:
    "border-violet-200 bg-violet-50 text-violet-700",
  ADMIN_SEKRETARIS:
    "border-blue-200 bg-blue-50 text-blue-700",
  ADMIN_BENDAHARA:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENGURUS:
    "border-amber-200 bg-amber-50 text-amber-700",
  ANGGOTA:
    "border-slate-200 bg-slate-50 text-slate-600",
};

export function UserAvatar({
  url,
  nama,
  size = "md",
}: {
  url: string | null;
  nama: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-10 w-10 rounded-xl",
    md: "h-12 w-12 rounded-2xl",
    lg: "h-24 w-24 rounded-[28px]",
  }[size];

  const iconSize = {
    sm: 18,
    md: 21,
    lg: 36,
  }[size];

  return (
    <div
      className={`
        flex ${sizeClass} shrink-0 items-center justify-center
        overflow-hidden bg-gradient-to-br from-teal-600
        to-cyan-500 text-white shadow-sm
      `}
    >
      {url ? (
        <img
          src={url}
          alt={`Foto profil ${nama}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <UserRound size={iconSize} />
      )}
    </div>
  );
}

export function RoleBadge({
  role,
}: {
  role: Role;
}) {
  return (
    <span
      className={`
        inline-flex w-fit items-center rounded-full border
        px-2.5 py-1 text-[11px] font-bold
        ${ROLE_STYLE[role]}
      `}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

export function StatusBadge({
  aktif,
}: {
  aktif: boolean;
}) {
  return (
    <span
      className={`
        inline-flex w-fit items-center gap-1.5 rounded-full border
        px-2.5 py-1 text-[11px] font-bold
        ${
          aktif
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-100 text-slate-500"
        }
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${aktif ? "bg-emerald-500" : "bg-slate-400"}
        `}
      />

      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}
