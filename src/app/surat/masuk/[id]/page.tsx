import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";





async function hapusSurat(
formData:FormData
){

"use server";


const session = await getSession();


if(!session){

redirect("/login");

}



const id = String(
formData.get("id")
);




await prisma.suratMasuk.delete({

where:{
id
}

});





await prisma.auditLog.create({

data:{


userId:String(session.id),


aktivitas:
`Menghapus surat masuk ${id}`


}

});





revalidatePath("/surat/masuk");


redirect("/surat/masuk");


}








function StatusBadge({
status
}:{
status:string
}){


const warna:any={


DRAFT:
"bg-gray-500/20 text-gray-400",


DIAJUKAN:
"bg-yellow-500/20 text-yellow-400",


DIPROSES:
"bg-blue-500/20 text-blue-400",


DISETUJUI:
"bg-green-500/20 text-green-400",


DITOLAK:
"bg-red-500/20 text-red-400",


SELESAI:
"bg-purple-500/20 text-purple-400"


};



return (

<span

className={`
px-3
py-1
rounded-full
${warna[status] || warna.DRAFT}
`}

>

{status}

</span>

)

}









export default async function DetailSuratMasuk({

params

}:{

params:{
id:string
}

}){



const session =
await getSession();



if(!session){

redirect("/login");

}






const surat =
await prisma.suratMasuk.findUnique({

where:{
id:params.id
}

});






if(!surat){

notFound();

}







return (

<div className="p-8">







<div className="
flex
justify-between
items-center
mb-8
">


<div>


<h1 className="
text-3xl
font-bold
">

Detail Surat Masuk

</h1>


<p className="
text-gray-400
mt-2
">

Informasi lengkap arsip surat masuk

</p>


</div>







<Link

href="/surat/masuk"

className="
bg-slate-800
px-5
py-3
rounded-lg
"

>

← Kembali

</Link>



</div>









<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
space-y-6
">







<div>

<p className="text-gray-400">

Nomor Surat

</p>


<p className="font-semibold text-lg">

{surat.nomorSurat}

</p>


</div>







<div>

<p className="text-gray-400">

Asal Surat

</p>


<p>

{surat.asal}

</p>


</div>







<div>

<p className="text-gray-400">

Perihal

</p>


<p>

{surat.perihal}

</p>


</div>








<div>

<p className="text-gray-400">

Tanggal Surat

</p>


<p>

{
surat.tanggalSurat.toLocaleDateString(
"id-ID"
)
}

</p>


</div>







<div>

<p className="text-gray-400 mb-2">

Status

</p>


<StatusBadge

status={surat.status}

/>


</div>









{
surat.fileUrl &&

<div>


<p className="text-gray-400 mb-2">

Lampiran

</p>


<a

href={surat.fileUrl}

target="_blank"

className="
bg-cyan-600
px-5
py-2
rounded-lg
inline-block
"

>

📄 Buka File Surat

</a>


</div>


}









<div className="
border-t
border-slate-800
pt-6
flex
gap-3
">


<Link

href={`/surat/masuk/${surat.id}/edit`}

className="
bg-yellow-600
px-5
py-3
rounded-lg
"

>

✏ Edit

</Link>







<form action={hapusSurat}>


<input

type="hidden"

name="id"

value={surat.id}

/>



<button

className="
bg-red-600
px-5
py-3
rounded-lg
"

>

🗑 Hapus

</button>


</form>



</div>









</div>







</div>

)

}