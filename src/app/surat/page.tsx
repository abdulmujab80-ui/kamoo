import { prisma } from "@/lib/prisma";
import Link from "next/link";


function StatusBadge({
status
}:{
status:string
}){


const color =
status === "DISETUJUI"
? "bg-green-500/20 text-green-400"
:
status === "DITOLAK"
? "bg-red-500/20 text-red-400"
:
status === "DIPROSES"
? "bg-blue-500/20 text-blue-400"
:
"bg-yellow-500/20 text-yellow-400";



return (

<span
className={`
px-3
py-1
rounded-full
text-sm
${color}
`}
>

{status}

</span>

)

}





export default async function SuratPage(){



const [
suratMasuk,
suratKeluar,
pengajuan

]=await Promise.all([


prisma.suratMasuk.findMany({

orderBy:{
createdAt:"desc"
}

}),



prisma.suratKeluar.findMany({

orderBy:{
createdAt:"desc"
}

}),



prisma.pengajuanSurat.findMany({

include:{
user:true
},

orderBy:{
createdAt:"desc"
}

})


]);



const data = [

...suratMasuk.map(item=>({

id:item.id,
jenis:"Surat Masuk",
nomor:item.nomorSurat,
perihal:item.perihal,
status:item.status,
tanggal:item.tanggalSurat,
link:null

})),



...suratKeluar.map(item=>({

id:item.id,
jenis:"Surat Keluar",
nomor:item.nomorSurat,
perihal:item.perihal,
status:item.status,
tanggal:item.tanggalSurat,
link:null

})),



...pengajuan.map(item=>({

id:item.id,
jenis:"Pengajuan",
nomor:"-",
perihal:item.keperluan,
status:item.status,
tanggal:item.createdAt,
link:`/surat/${item.id}`

}))


];





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

Persuratan

</h1>


<p className="
text-gray-400
mt-2
">

Manajemen surat organisasi KAMOO

</p>


</div>



<Link

href="/surat/pengajuan"

className="
bg-cyan-600
px-5
py-3
rounded-lg
font-semibold
hover:bg-cyan-700
"

>

+ Ajukan Surat

</Link>



</div>






<div
className="
bg-slate-900
rounded-xl
overflow-hidden
border
border-slate-800
"
>



<table className="w-full">



<thead
className="
bg-slate-800
"
>


<tr>


<th className="p-4 text-left">
Jenis
</th>


<th className="p-4 text-left">
Nomor
</th>


<th className="p-4 text-left">
Perihal
</th>


<th className="p-4 text-left">
Status
</th>


<th className="p-4 text-left">
Tanggal
</th>


<th className="p-4 text-left">
Aksi
</th>


</tr>


</thead>






<tbody>



{
data.length === 0 ? (


<tr>

<td
colSpan={6}
className="
p-8
text-center
text-gray-400
"
>

Belum ada data surat

</td>

</tr>


)

:

data.map(item=>(


<tr
key={item.id}
className="
border-t
border-slate-800
hover:bg-white/5
"
>



<td className="p-4">

{item.jenis}

</td>



<td className="p-4">

{item.nomor}

</td>



<td className="p-4">

{item.perihal}

</td>



<td className="p-4">

<StatusBadge
status={item.status}
/>

</td>



<td className="p-4">

{item.tanggal.toLocaleDateString(
"id-ID"
)}

</td>




<td className="p-4">


{
item.link && (

<Link

href={item.link}

className="
text-cyan-400
hover:underline
"

>

Detail

</Link>

)

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