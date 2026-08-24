import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";



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







function JenisBadge({
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









export default async function KeuanganPage(){



const session =
await getSession();



if(!session){

redirect("/login");

}





const [

masuk,

keluar,

reimburse,

transaksi


] = await Promise.all([






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

}),






prisma.reimburse.count({

where:{
status:"MENUNGGU"
}

}),






prisma.keuangan.findMany({

orderBy:{
tanggal:"desc"
},

take:10

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

Dashboard Keuangan

</h1>


<p className="
text-gray-400
mt-2
">

Monitoring keuangan organisasi KAMOO

</p>


</div>






<Link

href="/keuangan/reimburse"

className="
bg-cyan-600
hover:bg-cyan-700
px-5
py-3
rounded-lg
font-semibold
"

>

Kelola Reimburse

</Link>



</div>









<div className="
grid
grid-cols-4
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

<p className="
text-gray-400
">

Kas Masuk

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

<p className="
text-gray-400
">

Kas Keluar

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

<p className="
text-gray-400
">

Saldo

</p>


<h2 className="
text-2xl
font-bold
mt-3
">

<Rupiah value={saldo}/>

</h2>


</div>







<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-6
">

<p className="
text-gray-400
">

Reimburse Menunggu

</p>


<h2 className="
text-3xl
font-bold
mt-3
text-yellow-400
">

{reimburse}

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
">


<h2 className="
text-xl
font-bold
">

Transaksi Terbaru

</h2>


</div>








<table className="w-full">



<thead className="bg-slate-800">


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


</tr>


</thead>







<tbody>


{

transaksi.length===0 ?


<tr>

<td

colSpan={4}

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
"

>


<td className="p-4">

<JenisBadge
jenis={item.jenis}
/>

</td>





<td className="p-4">

{item.keterangan}

</td>






<td className="p-4">

<Rupiah value={item.jumlah}/>

</td>






<td className="p-4">

{
item.tanggal.toLocaleDateString(
"id-ID"
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