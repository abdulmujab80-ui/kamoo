import { prisma } from "@/lib/prisma";
import Link from "next/link";


export default async function DokumenPage(){


const dokumen =
await prisma.dokumen.findMany({

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
Dokumen
</h1>


<p className="
text-gray-400
mt-2
">
Arsip dokumen organisasi KAMOO
</p>

</div>




<Link

href="/dokumen/tambah"

className="
bg-cyan-600
hover:bg-cyan-700
px-5
py-3
rounded-lg
font-semibold
"

>

+ Upload Dokumen

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
Nama Dokumen
</th>


<th className="p-4 text-left">
Kategori
</th>


<th className="p-4 text-left">
Tanggal
</th>


<th className="p-4 text-left">
File
</th>


</tr>


</thead>




<tbody>



{
dokumen.length === 0

?

<tr>

<td
colSpan={4}
className="
p-8
text-center
text-gray-400
"
>

Belum ada dokumen

</td>

</tr>



:


dokumen.map((item)=>(


<tr

key={item.id}

className="
border-t
border-slate-800
"

>


<td className="p-4">

{item.nama}

</td>



<td className="p-4">

{item.kategori}

</td>




<td className="p-4">

{
item.createdAt.toLocaleDateString(
"id-ID"
)
}

</td>





<td className="p-4">


<a

href={item.fileUrl}

target="_blank"

className="
text-cyan-400
hover:underline
"

>

Lihat File

</a>


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