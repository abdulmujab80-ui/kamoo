"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/auth";
import { redirect } from "next/navigation";


export async function login(
  formData: FormData
){

  const email =
  String(formData.get("email"));


  const password =
  String(formData.get("password"));



  const user =
  await prisma.user.findUnique({

    where:{
      email
    }

  });



  if(!user){

    throw new Error(
      "Email tidak ditemukan"
    );

  }



  const valid =
  await bcrypt.compare(
    password,
    user.password
  );



  if(!valid){

    throw new Error(
      "Password salah"
    );

  }



  await createSession({

    id:user.id,

    nama:user.nama,

    email:user.email,

    role:user.role

  });



  redirect("/dashboard");

}