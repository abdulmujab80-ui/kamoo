import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  Inbox,
  Send,
  FileText,
  ClipboardCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  BarChart3,
  CalendarDays,
  FolderOpen,
  Users,
  Settings,
} from "lucide-react";


// ======================================================
// ROLE
// ======================================================

export type AppRole =
  | "SUPERADMIN"
  | "ADMIN_SEKRETARIS"
  | "ADMIN_BENDAHARA"
  | "PENGURUS"
  | "ANGGOTA";


// ======================================================
// NAVIGATION TYPES
// ======================================================

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: AppRole[];
  exact?: boolean;
};


export type NavGroup = {
  label: string;
  items: NavItem[];
};


// ======================================================
// ROLE GROUPS
// ======================================================

const ALL_ROLES: AppRole[] = [
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
  "ADMIN_BENDAHARA",
  "PENGURUS",
  "ANGGOTA",
];


const SURAT_ADMIN: AppRole[] = [
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
];


const FINANCE_ADMIN: AppRole[] = [
  "SUPERADMIN",
  "ADMIN_BENDAHARA",
];


const REIMBURSE_USERS: AppRole[] = [
  "SUPERADMIN",
  "ADMIN_BENDAHARA",
  "PENGURUS",
  "ANGGOTA",
];


const DOCUMENT_USERS: AppRole[] = [
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
  "PENGURUS",
  "ANGGOTA",
];


// ======================================================
// NAVIGATION
// ======================================================

export const navigationGroups: NavGroup[] = [

  // ====================================================
  // UTAMA
  // ====================================================

  {
    label: "Utama",

    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ALL_ROLES,
        exact: true,
      },
    ],
  },


  // ====================================================
  // PERSURATAN
  // ====================================================

  {
    label: "Persuratan",

    items: [
      {
        title: "Surat Masuk",
        href: "/surat/masuk",
        icon: Inbox,
        roles: SURAT_ADMIN,
      },

      {
        title: "Surat Keluar",
        href: "/surat/keluar",
        icon: Send,
        roles: SURAT_ADMIN,
      },

      {
        title: "Pengajuan Surat",
        href: "/surat/pengajuan",
        icon: FileText,
        roles: [
          "SUPERADMIN",
          "ADMIN_SEKRETARIS",
          "PENGURUS",
          "ANGGOTA",
        ],
      },

      {
        title: "Approval Surat",
        href: "/approval",
        icon: ClipboardCheck,
        roles: SURAT_ADMIN,
      },
    ],
  },


  // ====================================================
  // KEUANGAN
  // ====================================================

  {
    label: "Keuangan",

    items: [
      {
        title: "Uang Masuk",
        href: "/keuangan/masuk",
        icon: ArrowDownLeft,
        roles: FINANCE_ADMIN,
      },

      {
        title: "Uang Keluar",
        href: "/keuangan/keluar",
        icon: ArrowUpRight,
        roles: FINANCE_ADMIN,
      },

      {
        title: "Reimburse",
        href: "/keuangan/reimburse",
        icon: Receipt,
        roles: REIMBURSE_USERS,
      },

      {
        title: "Laporan Keuangan",
        href: "/keuangan/laporan",
        icon: BarChart3,
        roles: FINANCE_ADMIN,
      },
    ],
  },


  // ====================================================
  // ORGANISASI
  // ====================================================

  {
    label: "Organisasi",

    items: [
      {
        title: "Jadwal Kegiatan",
        href: "/jadwal",
        icon: CalendarDays,
        roles: ALL_ROLES,
      },

      {
        title: "Loker",
        href: "/loker",
        icon: FolderOpen,
        roles: ALL_ROLES,
      },

      {
        title: "Pengguna",
        href: "/pengguna",
        icon: Users,
        roles: [
          "SUPERADMIN",
        ],
      },
    ],
  },


  // ====================================================
  // SISTEM
  // ====================================================

  {
    label: "Sistem",

    items: [
      {
        title: "Pengaturan",
        href: "/pengaturan",
        icon: Settings,
        roles: [
          "SUPERADMIN",
        ],
      },
    ],
  },

];


// ======================================================
// ACCESS CHECK
// ======================================================

export function canSeeNavigation(
  roles: AppRole[],
  role: AppRole
) {
  return roles.includes(role);
}


// ======================================================
// ACTIVE STATE
// ======================================================

export function isNavigationActive(
  pathname: string,
  href: string,
  exact = false
) {
  if (exact) {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}