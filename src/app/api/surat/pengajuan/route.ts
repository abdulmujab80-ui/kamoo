import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";



export async function POST(
request:Request
){


try{


const session = await getSession();



if(!session){

return NextResponse.json(
{
message:"Unauthorized"
},
{
status:401
}
)

}




const formData = await request.formData();



const jenis =
formData.get("jenis") as string;


const tujuan =
formData.get("tujuan") as string;


const keperluan =
formData.get("keperluan") as string;



const tanggalMulai =
formData.get("tanggalMulai") as string;


const tanggalSelesai =
formData.get("tanggalSelesai") as string;





await prisma.pengajuanSurat.create({

data:{


userId:
session.id as string,


jenis,


tujuan,


keperluan,


tanggalMulai:
tanggalMulai
?
new Date(tanggalMulai)
:
null,


tanggalSelesai:
tanggalSelesai
?
new Date(tanggalSelesai)
:
null,


status:"DIAJUKAN"


}


});




return NextResponse.redirect(
new URL(
"/surat",
request.url
)

);



}catch(error){


console.log(error);



return NextResponse.json(

{
message:"Gagal membuat pengajuan"
},

{
status:500
}

);


}



}