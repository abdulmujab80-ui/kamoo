"use server";

import { hash } from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type UserFormState = {
  error: string | null;
};

export type ToggleStatusResult = {
  success: boolean;
  aktif?: boolean;
  error?: string;
};

const ROLE_VALUES: Role[] = [
  "SUPERADMIN",
  "ADMIN_SEKRETARIS",
  "ADMIN_BENDAHARA",
  "PENGURUS",
  "ANGGOTA",
];

async function requireSuperadmin() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (String(session.role) !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return {
    id: String(session.id),
    role: String(session.role),
  };
}

function cleanEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function getRole(value: FormDataEntryValue | null): Role | null {
  const raw = cleanText(value) as Role;
  return ROLE_VALUES.includes(raw) ? raw : null;
}

function getBoolean(value: FormDataEntryValue | null) {
  return String(value ?? "") === "true";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function ensureSuperadminSafety({
  targetId,
  currentRole,
  currentActive,
  nextRole,
  nextActive,
  actorId,
}: {
  targetId: string;
  currentRole: Role;
  currentActive: boolean;
  nextRole: Role;
  nextActive: boolean;
  actorId: string;
}) {
  if (targetId === actorId && nextActive === false) {
    throw new Error(
      "Akun Superadmin yang sedang digunakan tidak dapat dinonaktifkan."
    );
  }

  if (targetId === actorId && nextRole !== "SUPERADMIN") {
    throw new Error(
      "Role akun Superadmin yang sedang digunakan tidak dapat diturunkan."
    );
  }

  const removesActiveSuperadmin =
    currentRole === "SUPERADMIN" &&
    currentActive &&
    (nextRole !== "SUPERADMIN" || !nextActive);

  if (!removesActiveSuperadmin) {
    return;
  }

  const activeSuperadmins = await prisma.user.count({
    where: {
      role: "SUPERADMIN",
      aktif: true,
    },
  });

  if (activeSuperadmins <= 1) {
    throw new Error("Minimal harus ada satu Superadmin aktif.");
  }
}

export async function createUser(
  _previousState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const actor = await requireSuperadmin();

  const nama = cleanText(formData.get("nama"));
  const email = cleanEmail(formData.get("email"));
  const role = getRole(formData.get("role"));
  const aktif = getBoolean(formData.get("aktif"));
  const password = cleanText(formData.get("password"));
  const confirmPassword = cleanText(formData.get("confirmPassword"));

  if (nama.length < 2) {
    return { error: "Nama minimal 2 karakter." };
  }

  if (!isValidEmail(email)) {
    return { error: "Alamat email tidak valid." };
  }

  if (!role) {
    return { error: "Role pengguna tidak valid." };
  }

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return { error: "Email sudah digunakan oleh akun lain." };
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        nama,
        email,
        password: passwordHash,
        role,
        aktif,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        modul: "PENGGUNA",
        dataId: created.id,
        aktivitas:
          `Membuat akun pengguna "${created.nama}" dengan role ${created.role}`,
      },
    });

    return created;
  });

  revalidatePath("/pengguna");
  revalidatePath("/dashboard");

  redirect(`/pengguna/${user.id}`);
}

export async function updateUser(
  _previousState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const actor = await requireSuperadmin();

  const id = cleanText(formData.get("id"));
  const nama = cleanText(formData.get("nama"));
  const email = cleanEmail(formData.get("email"));
  const role = getRole(formData.get("role"));
  const aktif = getBoolean(formData.get("aktif"));
  const newPassword = cleanText(formData.get("newPassword"));
  const confirmPassword = cleanText(formData.get("confirmPassword"));

  if (!id) {
    return { error: "ID pengguna tidak ditemukan." };
  }

  if (nama.length < 2) {
    return { error: "Nama minimal 2 karakter." };
  }

  if (!isValidEmail(email)) {
    return { error: "Alamat email tidak valid." };
  }

  if (!role) {
    return { error: "Role pengguna tidak valid." };
  }

  if (newPassword && newPassword.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (newPassword && newPassword !== confirmPassword) {
    return { error: "Konfirmasi password baru tidak sama." };
  }

  const current = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      aktif: true,
    },
  });

  if (!current) {
    return { error: "Pengguna tidak ditemukan." };
  }

  const duplicateEmail = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id },
    },
    select: { id: true },
  });

  if (duplicateEmail) {
    return { error: "Email sudah digunakan oleh akun lain." };
  }

  try {
    await ensureSuperadminSafety({
      targetId: current.id,
      currentRole: current.role,
      currentActive: current.aktif,
      nextRole: role,
      nextActive: aktif,
      actorId: actor.id,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Perubahan akun tidak diizinkan.",
    };
  }

  const passwordHash = newPassword
    ? await hash(newPassword, 12)
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        nama,
        email,
        role,
        aktif,
        ...(passwordHash ? { password: passwordHash } : {}),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        modul: "PENGGUNA",
        dataId: id,
        aktivitas: passwordHash
          ? `Memperbarui akun dan mereset password pengguna "${nama}"`
          : `Memperbarui akun pengguna "${nama}"`,
      },
    });
  });

  revalidatePath("/pengguna");
  revalidatePath(`/pengguna/${id}`);
  revalidatePath(`/pengguna/${id}/edit`);
  revalidatePath("/dashboard");

  redirect(`/pengguna/${id}`);
}

export async function toggleUserStatus(
  userId: string
): Promise<ToggleStatusResult> {
  const actor = await requireSuperadmin();

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nama: true,
      role: true,
      aktif: true,
    },
  });

  if (!current) {
    return {
      success: false,
      error: "Pengguna tidak ditemukan.",
    };
  }

  const nextActive = !current.aktif;

  try {
    await ensureSuperadminSafety({
      targetId: current.id,
      currentRole: current.role,
      currentActive: current.aktif,
      nextRole: current.role,
      nextActive,
      actorId: actor.id,
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Status pengguna tidak dapat diubah.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: current.id },
      data: { aktif: nextActive },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        modul: "PENGGUNA",
        dataId: current.id,
        aktivitas:
          `${nextActive ? "Mengaktifkan" : "Menonaktifkan"} akun pengguna "${current.nama}"`,
      },
    });
  });

  revalidatePath("/pengguna");
  revalidatePath(`/pengguna/${current.id}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    aktif: nextActive,
  };
}
