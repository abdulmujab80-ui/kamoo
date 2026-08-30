import {
  getSession,
} from "@/lib/auth";

import {
  redirect,
} from "next/navigation";

import DashboardSuperadmin from "./components/DashboardSuperadmin";
import DashboardSekretaris from "./components/DashboardSekretaris";
import DashboardBendahara from "./components/DashboardBendahara";
import DashboardUser from "./components/DashboardUser";

import type {
  AppRole,
} from "@/components/navigation";


export default async function DashboardPage() {

  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  const role =
    String(
      session.role
    ) as AppRole;


  const user = {
    id:
      String(
        session.id ?? ""
      ),

    nama:
      String(
        session.nama ??
        "Pengguna"
      ),

    email:
      String(
        session.email ?? ""
      ),

    role,
  };


  switch (role) {

    case "SUPERADMIN":
      return (
        <DashboardSuperadmin
          user={user}
        />
      );


    case "ADMIN_SEKRETARIS":
      return (
        <DashboardSekretaris
          user={user}
        />
      );


    case "ADMIN_BENDAHARA":
      return (
        <DashboardBendahara
          user={user}
        />
      );


    case "PENGURUS":

    case "ANGGOTA":
      return (
        <DashboardUser
          user={user}
        />
      );


    default:
      redirect("/login");

  }
}