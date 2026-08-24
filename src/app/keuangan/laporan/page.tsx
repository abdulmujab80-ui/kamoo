import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";



function Rupiah({
value
}:{
value:number
}){


return (

<span>

Rp {value.toLocaleString("id-ID")}

</span>

)

}







function BadgeJenis({
jenis
}:{
jenis:string
}){


return (

<span

className={`
px-3
py-1
rounded-full
text-sm
${
jenis==="MASUK"
?
"bg-green-500/20 text-green-400"
:
"bg-red-500/20 text-red-400"
}
`}

>

{jenis}

</span>

)

}










export default async function LaporanKeuangan(){



const session =
await getSession();



if(!session){

redirect("/login");

}






const [

transaksi,

masuk,

keluar


] = await Promise.all([





prisma.keuangan.findMany({

orderBy:{
tanggal:"desc"
}

}),






prisma.keuangan.aggregate({

where:{
jenis:"MASUK"
},

_sum:{
jumlah:true
}

}),







prisma.keuangan.aggregate({

where:{
jenis:"KELUAR"
},

_sum:{
jumlah:true
}

})



]);







const totalMasuk =
masuk._sum.jumlah || 0;



const totalKeluar =
keluar._sum.jumlah || 0;



const saldo =
totalMasuk - totalKeluar;








return (

<div className="p-8">






<div className="mb-8">


<h1 className="
text-3xl
font-bold
">

Laporan Keuangan

</h1>


<p className="
text-gray-400
mt-2
">

Rekap transaksi keuangan organisasi KAMOO

</p>


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
p-6
">


<p className="text-gray-400">

Total Pemasukan

</p>


<h2 className="
text-2xl
font-bold
text-green-400
mt-3
">

<Rupiah value={totalMasuk}/>

</h2>


</div>









<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-6
">


<p className="text-gray-400">

Total Pengeluaran

</p>


<h2 className="
text-2xl
font-bold
text-red-400
mt-3
">

<Rupiah value={totalKeluar}/>

</h2>


</div>









<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-6
">


<p className="text-gray-400">

Saldo Akhir

</p>


<h2 className="
text-2xl
font-bold
mt-3
">

<Rupiah value={saldo}/>

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







<div className="
p-6
border-b
border-slate-800
flex
justify-between
items-center
">


<h2 className="
text-xl
font-bold
">

Detail Transaksi

</h2>



<button

className="
bg-slate-700
px-4
py-2
rounded-lg
"

>

Export Excel

</button>



</div>









<table className="w-full">



<thead className="
bg-slate-800
">


<tr>


<th className="p-4 text-left">
Jenis
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
Bukti
</th>


</tr>


</thead>









<tbody>




{

transaksi.length===0 ?


<tr>


<td

colSpan={5}

className="
p-8
text-center
text-gray-400
"

>

Belum ada transaksi

</td>


</tr>





:



transaksi.map((item)=>(



<tr

key={item.id}

className="
border-t
border-slate-800
hover:bg-white/5
"

>


<td className="p-4">


<BadgeJenis

jenis={item.jenis}

/>


</td>







<td className="p-4">

{item.keterangan}

</td>







<td className="p-4">

<Rupiah
value={item.jumlah}
/>

</td>








<td className="p-4">


{
item.tanggal.toLocaleDateString(
"id-ID"
)
}


</td>







<td className="p-4">


{

item.buktiUrl &&


<a

href={item.buktiUrl}

target="_blank"

className="
text-cyan-400
hover:underline
"

>

Lihat

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