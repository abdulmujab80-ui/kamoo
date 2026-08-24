import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";




async function updateStatus(
formData:FormData
){

"use server";


const session = await getSession();


if(!session){
redirect("/login");
}



const id =
String(formData.get("id"));



const status =
String(formData.get("status"));





await prisma.suratKeluar.update({

where:{
id
},

data:{
status:status as any
}

});





revalidatePath("/surat/keluar");

revalidatePath(`/surat/keluar/${id}`);



}








function Badge({
status
}:{
status:string
}){


const color:any={


DRAFT:
"bg-gray-500/20 text-gray-400",


DIAJUKAN:
"bg-yellow-500/20 text-yellow-400",


DIPROSES:
"bg-blue-500/20 text-blue-400",


DISETUJUI:
"bg-green-500/20 text-green-400",


DITOLAK:
"bg-red-500/20 text-red-400"


};



return (

<span

className={`
px-3
py-1
rounded-full
${color[status]}
`}

>

{status}

</span>

)

}









export default async function DetailSuratKeluar({

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
await prisma.suratKeluar.findUnique({

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

Detail Surat Keluar

</h1>


<p className="
text-gray-400
mt-2
">

Informasi surat resmi organisasi

</p>


</div>




<Link

href="/surat/keluar"

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


<p className="font-semibold">

{surat.nomorSurat}

</p>

</div>









<div>

<p className="text-gray-400">

Tujuan

</p>


<p>

{surat.tujuan}

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


<Badge

status={surat.status}

/>


</div>









{
surat.fileUrl &&

<div>


<a

href={surat.fileUrl}

target="_blank"

className="
bg-cyan-600
px-5
py-3
rounded-lg
inline-block
"

>

📄 Lihat Dokumen

</a>


</div>

}









{

(
session.role==="SUPERADMIN" ||
session.role==="ADMIN_SEKRETARIS"
)

&&

(


<div className="
border-t
border-slate-800
pt-6
flex
gap-3
">


<form action={updateStatus}>


<input

type="hidden"

name="id"

value={surat.id}

/>


<input

type="hidden"

name="status"

value="DISETUJUI"

/>



<button

className="
bg-green-600
px-5
py-3
rounded-lg
"

>

✓ Terbitkan

</button>


</form>







<form action={updateStatus}>


<input

type="hidden"

name="id"

value={surat.id}

/>


<input

type="hidden"

name="status"

value="DITOLAK"

/>


<button

className="
bg-red-600
px-5
py-3
rounded-lg
"

>

✕ Tolak

</button>


</form>



</div>


)


}




</div>





</div>


)

}