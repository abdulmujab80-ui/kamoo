import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";



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







export default async function ReimbursePage(){



const session =
await getSession();


if(!session){

redirect("/login");

}





const reimburse =
await prisma.reimburse.findMany({

include:{
user:true
},

orderBy:{
createdAt:"desc"
}

});








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

Reimburse

</h1>


<p className="
text-gray-400
mt-2
">

Pengajuan penggantian biaya organisasi

</p>


</div>





<Link

href="/keuangan/reimburse/tambah"

className="
bg-cyan-600
px-5
py-3
rounded-lg
font-semibold
"

>

+ Ajukan Reimburse

</Link>


</div>










<div className="
bg-slate-900
border
border-slate-800
rounded-xl
overflow-hidden
">





<table className="w-full">



<thead className="bg-slate-800">


<tr>


<th className="p-4 text-left">
Pemohon
</th>


<th className="p-4 text-left">
Keterangan
</th>


<th className="p-4 text-left">
Jumlah
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

reimburse.length===0 ?


<tr>

<td

colSpan={6}

className="
p-8
text-center
text-gray-400
"

>

Belum ada pengajuan reimburse

</td>


</tr>



:


reimburse.map((item)=>(


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


<p className="text-sm text-gray-400">

{item.user.email}

</p>


</td>






<td className="p-4">

{item.keterangan}

</td>






<td className="p-4">

Rp {item.jumlah.toLocaleString("id-ID")}

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


{

item.buktiUrl &&

<a

href={item.buktiUrl}

target="_blank"

className="
bg-cyan-600
px-3
py-2
rounded-lg
text-sm
"

>

Bukti

</a>


}


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