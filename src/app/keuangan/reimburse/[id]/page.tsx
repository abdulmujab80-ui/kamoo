import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";





async function prosesReimburse(
formData:FormData
){

"use server";



const session =
await getSession();



if(!session){

redirect("/login");

}





if(
session.role !== "SUPERADMIN" &&
session.role !== "ADMIN_BENDAHARA"
){

redirect("/dashboard");

}





const id =
String(
formData.get("id")
);




const status =
String(
formData.get("status")
);




const catatan =
String(
formData.get("catatan") || ""
);








await prisma.$transaction(async(tx)=>{






await tx.reimburse.update({

where:{
id
},

data:{
status:status as any
}

});









await tx.approval.create({

data:{


modul:"REIMBURSE",


dataId:id,


status:status as any,


catatan,


userId:String(session.id)


}


});









await tx.auditLog.create({

data:{


userId:String(session.id),


aktivitas:
`${status} reimburse ${id}`


}


});





});








revalidatePath(
"/keuangan/reimburse"
);


revalidatePath(
`/keuangan/reimburse/${id}`
);



}









function StatusBadge({
status
}:{
status:string
}){


const style:any={


MENUNGGU:
"bg-yellow-500/20 text-yellow-400",


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
text-sm
${style[status]}
`}

>

{status}

</span>

)

}









export default async function DetailReimburse({

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







const reimburse =
await prisma.reimburse.findUnique({

where:{
id:params.id
},


include:{
user:true
}

});






if(!reimburse){

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

Detail Reimburse

</h1>


<p className="
text-gray-400
mt-2
">

Informasi pengajuan penggantian biaya

</p>


</div>







<Link

href="/keuangan/reimburse"

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


<p className="
text-gray-400
">

Pemohon

</p>


<p className="
font-semibold
">

{reimburse.user.nama}

</p>


<p className="
text-sm
text-gray-500
">

{reimburse.user.email}

</p>


</div>









<div>


<p className="
text-gray-400
">

Keterangan

</p>


<p>

{reimburse.keterangan}

</p>


</div>









<div>


<p className="
text-gray-400
">

Jumlah

</p>


<p className="
text-xl
font-bold
">

Rp {reimburse.jumlah.toLocaleString("id-ID")}

</p>


</div>









<div>


<p className="
text-gray-400
mb-2
">

Status

</p>


<StatusBadge

status={reimburse.status}

/>


</div>









<div>


<p className="
text-gray-400
mb-2
">

Tanggal Pengajuan

</p>


<p>

{
reimburse.createdAt.toLocaleDateString(
"id-ID"
)
}

</p>


</div>









{

reimburse.buktiUrl &&


<div>


<p className="
text-gray-400
mb-2
">

Bukti Pembayaran

</p>



<a

href={reimburse.buktiUrl}

target="_blank"

className="
bg-cyan-600
px-5
py-3
rounded-lg
inline-block
"

>

📄 Lihat Bukti

</a>


</div>


}









{

(
session.role==="SUPERADMIN" ||
session.role==="ADMIN_BENDAHARA"
)

&&

reimburse.status==="MENUNGGU"

&&


<div className="
border-t
border-slate-800
pt-6
flex
gap-3
">


<form action={prosesReimburse}>


<input

type="hidden"

name="id"

value={reimburse.id}

/>


<input

type="hidden"

name="status"

value="DISETUJUI"

/>


<input

type="hidden"

name="catatan"

value="Reimburse disetujui bendahara"

/>



<button

className="
bg-green-600
hover:bg-green-700
px-5
py-3
rounded-lg
font-semibold
"

>

✓ Setujui

</button>


</form>









<form action={prosesReimburse}>


<input

type="hidden"

name="id"

value={reimburse.id}

/>


<input

type="hidden"

name="status"

value="DITOLAK"

/>


<input

type="hidden"

name="catatan"

value="Reimburse ditolak bendahara"

/>



<button

className="
bg-red-600
hover:bg-red-700
px-5
py-3
rounded-lg
font-semibold
"

>

✕ Tolak

</button>


</form>



</div>


}








</div>







</div>


)

}