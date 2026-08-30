import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";


export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return {
    id: String(session.id),
    nama: String(session.nama ?? ""),
    email: String(session.email ?? ""),
    role: String(session.role) as Role,
  };
}


export async function requireRole(
  allowedRoles: Role[]
) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}


export async function requireSekretaris() {
  return requireRole([
    "SUPERADMIN",
    "ADMIN_SEKRETARIS",
  ]);
}


export async function requireBendahara() {
  return requireRole([
    "SUPERADMIN",
    "ADMIN_BENDAHARA",
  ]);
}