import { prisma } from "@/lib/prisma";
import Link from "next/link";



function StatusBadge({
status
}:{
status:string
}){


const style:any = {

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
text-sm
${style[status] || style.DRAFT}
`}

>

{status}

</span>

)

}







export default async function SuratKeluarPage(){



const [

surat,

total

]= await Promise.all([



prisma.suratKeluar.findMany({

orderBy:{
createdAt:"desc"
}

}),



prisma.suratKeluar.count()



]);








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

Surat Keluar

</h1>


<p className="
text-gray-400
mt-2
">

Arsip dan pengelolaan surat keluar organisasi KAMOO

</p>


</div>






<Link

href="/surat/keluar/tambah"

className="
bg-cyan-600
hover:bg-cyan-700
px-5
py-3
rounded-lg
font-semibold
"

>

+ Buat Surat

</Link>



</div>










<div className="
grid
grid-cols-3
gap-5
mb-8
">



<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-5
">

<p className="text-gray-400">

Total Surat Keluar

</p>


<h2 className="
text-3xl
font-bold
mt-2
">

{total}

</h2>


</div>







<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-5
">

<p className="text-gray-400">

Dokumen

</p>


<h2 className="
text-3xl
font-bold
mt-2
">

{surat.filter(
x=>x.fileUrl
).length}

</h2>


</div>







<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-5
">

<p className="text-gray-400">

Status

</p>


<h2 className="
text-xl
font-bold
mt-3
">

Aktif

</h2>


</div>



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

Nomor Surat

</th>


<th className="p-4 text-left">

Tujuan

</th>


<th className="p-4 text-left">

Perihal

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

surat.length===0 ?


<tr>


<td

colSpan={6}

className="
p-8
text-center
text-gray-400
"

>

Belum ada surat keluar

</td>


</tr>





:



surat.map((item)=>(



<tr

key={item.id}

className="
border-t
border-slate-800
hover:bg-white/5
"

>




<td className="p-4">

{item.nomorSurat}

</td>





<td className="p-4">

{item.tujuan}

</td>





<td className="p-4">

{item.perihal}

</td>





<td className="p-4">

{
item.tanggalSurat.toLocaleDateString(
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


<div className="flex gap-2">


<Link

href={`/surat/keluar/${item.id}`}

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






{

item.fileUrl &&

<a

href={item.fileUrl}

target="_blank"

className="
bg-cyan-600
hover:bg-cyan-700
px-3
py-2
rounded-lg
text-sm
"

>

File

</a>


}



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