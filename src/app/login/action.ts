"use server";

import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { QUOTES } from "@/lib/quotes";

import { redirect } from "next/navigation";


export async function login(
  formData: FormData
) {
  const email =
    String(
      formData.get("email") ?? ""
    )
      .trim()
      .toLowerCase();


  const password =
    String(
      formData.get("password") ?? ""
    );


  if (
    !email ||
    !password
  ) {
    throw new Error(
      "Email dan password wajib diisi."
    );
  }


  const user =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });


  if (!user) {
    throw new Error(
      "Email tidak ditemukan"
    );
  }


  if (!user.aktif) {
    throw new Error(
      "Akun tidak aktif"
    );
  }


  const valid =
    await bcrypt.compare(
      password,
      user.password
    );


  if (!valid) {
    throw new Error(
      "Password salah"
    );
  }


  // Quote dipilih SATU KALI setiap login.
  // Refresh dashboard tidak mengganti quote.
  const quoteIndex =
    Math.floor(
      Math.random() *
        QUOTES.length
    );


  await createSession({
    id: user.id,

    nama: user.nama,

    email: user.email,

    role: user.role,

    quoteIndex,
  });


  redirect("/dashboard");
}