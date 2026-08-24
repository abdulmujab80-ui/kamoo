import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";



async function prosesApproval(formData:FormData){

"use server";


const session = await getSession();


if(!session){
redirect("/login");
}




if(
session.role !== "SUPERADMIN" &&
session.role !== "ADMIN_SEKRETARIS"
){

redirect("/dashboard");

}





const id =
String(formData.get("id"));



const status =
String(formData.get("status"));



const catatan =
String(
formData.get("catatan") || ""
);





await prisma.$transaction(async(tx)=>{



await tx.pengajuanSurat.update({

where:{
id
},

data:{
status:status as any
}

});







await tx.approval.create({

data:{


modul:"PENGAJUAN_SURAT",


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
`${status} pengajuan surat ${id}`


}


});



});






revalidatePath("/approval");

revalidatePath("/surat");

revalidatePath(`/surat/${id}`);



}









function StatusBadge({
status
}:{
status:string
}){


const style:any={


DIAJUKAN:
"bg-yellow-500/20 text-yellow-400",


DISETUJUI:
"bg-green-500/20 text-green-400",


DITOLAK:
"bg-red-500/20 text-red-400",


DIPROSES:
"bg-blue-500/20 text-blue-400"


};



return (

<span

className={`
px-3
py-1
rounded-full
text-sm
${style[status] || style.DIAJUKAN}
`}

>

{status}

</span>

)

}









export default async function ApprovalPage(){



const session =
await getSession();



if(!session){

redirect("/login");

}





if(
session.role !== "SUPERADMIN" &&
session.role !== "ADMIN_SEKRETARIS"
){

redirect("/dashboard");

}







const data =
await prisma.pengajuanSurat.findMany({

where:{

status:"DIAJUKAN"

},


include:{

user:true

},


orderBy:{

createdAt:"desc"

}


});









return (

<div className="p-8">





<div className="mb-8">


<h1 className="
text-3xl
font-bold
">

Approval Surat

</h1>


<p className="
text-gray-400
mt-2
">

Daftar pengajuan surat yang membutuhkan persetujuan

</p>


</div>









<div className="
bg-slate-900
border
border-slate-800
rounded-xl
overflow-hidden
">





<table className="w-full">



<thead className="
bg-slate-800
">


<tr>


<th className="p-4 text-left">
Pemohon
</th>


<th className="p-4 text-left">
Jenis
</th>


<th className="p-4 text-left">
Keperluan
</th>


<th className="p-4 text-left">
Tanggal
</th>


<th className="p-4 text-left">
Status
</th>


<th className="p-4 text-left">
Aksi
</th>


</tr>


</thead>









<tbody>



{
data.length === 0 ?


<tr>

<td

colSpan={6}

className="
p-10
text-center
text-gray-400
"

>

Tidak ada pengajuan menunggu approval

</td>

</tr>


:



data.map((item)=>(



<tr

key={item.id}

className="
border-t
border-slate-800
hover:bg-white/5
"

>







<td className="p-4">


<p className="font-semibold">

{item.user.nama}

</p>


<p className="
text-sm
text-gray-400
">

{item.user.email}

</p>


</td>









<td className="p-4">

{item.jenis}

</td>









<td className="p-4 max-w-xs">

{item.keperluan}

</td>









<td className="p-4">

{
item.createdAt.toLocaleDateString(
"id-ID"
)
}

</td>








<td className="p-4">


<StatusBadge

status={item.status}

/>


</td>









<td className="p-4">



<div className="
flex
gap-2
">





<Link

href={`/surat/${item.id}`}

className="
bg-slate-700
hover:bg-slate-600
px-3
py-2
rounded-lg
text-sm
"

>

Detail

</Link>









<form action={prosesApproval}>


<input

type="hidden"

name="id"

value={item.id}

/>


<input

type="hidden"

name="status"

value="DISETUJUI"

/>


<input

type="hidden"

name="catatan"

value="Pengajuan disetujui"

/>



<button

className="
bg-green-600
hover:bg-green-700
px-3
py-2
rounded-lg
"

>

✓

</button>



</form>









<form action={prosesApproval}>


<input

type="hidden"

name="id"

value={item.id}

/>


<input

type="hidden"

name="status"

value="DITOLAK"

/>


<input

type="hidden"

name="catatan"

value="Pengajuan ditolak"

/>



<button

className="
bg-red-600
hover:bg-red-700
px-3
py-2
rounded-lg
"

>

✕

</button>



</form>





</div>


</td>






</tr>


))


}




</tbody>






</table>







</div>





</div>


)

}