import { prisma } from "@/lib/prisma";


export async function generateNomorSurat(
  kodeJenis: string,
  kodeNomor: string
) {


const sekarang = new Date();



const tahun =
sekarang.getFullYear();



const tanggal =
String(
sekarang.getDate()
)
.padStart(2,"0");



const bulan =
String(
sekarang.getMonth()+1
)
.padStart(2,"0");






const nomor =
await prisma.nomorSurat.upsert({

where:{
tahun
},


update:{

nomorUrut:{
increment:1
}

},


create:{

tahun,

nomorUrut:1

}


});







const nomorUrut =
String(nomor.nomorUrut)
.padStart(2,"0");







return `${nomorUrut}.${kodeJenis}.${kodeNomor}/KATI/${tanggal}.${bulan}.${tahun}`;


}