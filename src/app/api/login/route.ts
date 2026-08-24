import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";


export async function POST(
  request: Request
) {

  try {


    const body = await request.json();


    const {
      email,
      password
    } = body;



    if(!email || !password){

      return NextResponse.json(
        {
          message:"Email dan password wajib diisi"
        },
        {
          status:400
        }
      );

    }



    const user = await prisma.user.findUnique({

      where:{
        email
      }

    });



    if(!user){

      return NextResponse.json(
        {
          message:"Email tidak ditemukan"
        },
        {
          status:401
        }
      );

    }



    const validPassword = await bcrypt.compare(

      password,

      user.password

    );



    if(!validPassword){

      return NextResponse.json(
        {
          message:"Password salah"
        },
        {
          status:401
        }
      );

    }



    await createSession({

      id:user.id,

      nama:user.nama,

      email:user.email,

      role:user.role

    });



    return NextResponse.json({

      success:true,

      user:{

        id:user.id,

        nama:user.nama,

        role:user.role

      }

    });



  } catch(error){


    console.error(error);



    return NextResponse.json(

      {
        message:"Terjadi kesalahan server"
      },

      {
        status:500
      }

    );


  }

}