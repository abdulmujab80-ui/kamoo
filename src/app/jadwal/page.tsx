import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";





function formatDate(date:Date){

return date.toISOString().split("T")[0];

}







export default async function JadwalPage(){



const session =
await getSession();



if(!session){

redirect("/login");

}






const jadwal =
await prisma.jadwal.findMany({

orderBy:{
mulai:"asc"
}

});





const now = new Date();



const year =
now.getFullYear();



const month =
now.getMonth();




const firstDay =
new Date(
year,
month,
1
).getDay();



const totalDays =
new Date(
year,
month+1,
0
).getDate();






const bulan = now.toLocaleDateString(
"id-ID",
{
month:"long",
year:"numeric"
}
);







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

Kalender Kegiatan

</h1>


<p className="
text-gray-400
mt-2
">

Agenda organisasi KAMOO

</p>


</div>






<Link

href="/jadwal/tambah"

className="
bg-cyan-600
hover:bg-cyan-700
px-5
py-3
rounded-lg
font-semibold
"

>

+ Tambah Kegiatan

</Link>



</div>









<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-6
">







<div className="
mb-6
">

<h2 className="
text-2xl
font-bold
capitalize
">

{bulan}

</h2>

</div>









<div className="
grid
grid-cols-7
gap-2
mb-3
">


{

[
"Minggu",
"Senin",
"Selasa",
"Rabu",
"Kamis",
"Jumat",
"Sabtu"
].map(day=>(


<div

key={day}

className="
text-center
text-sm
text-gray-400
font-semibold
p-2
"

>

{day}

</div>


))

}


</div>









<div className="
grid
grid-cols-7
gap-2
">





{

Array.from({

length:firstDay

}).map((_,i)=>(


<div

key={`empty-${i}`}

className="
h-32
bg-slate-950
rounded-lg
"

>


</div>


))


}









{

Array.from({

length:totalDays

}).map((_,i)=>{


const tanggal =
i+1;



const dateString =
`${year}-${String(month+1).padStart(2,"0")}-${String(tanggal).padStart(2,"0")}`;





const eventHariIni =
jadwal.filter(item=>{

return formatDate(item.mulai)
===
dateString

});






return (

<div

key={tanggal}

className="
min-h-32
bg-slate-950
border
border-slate-800
rounded-lg
p-3
hover:bg-white/5
"

>



<p className="
font-semibold
mb-2
">

{tanggal}

</p>








<div className="
space-y-2
">


{

eventHariIni.map(item=>(


<Link

key={item.id}

href={`/jadwal/${item.id}`}

className="
block
bg-cyan-600/20
border
border-cyan-600/30
rounded-lg
p-2
text-xs
hover:bg-cyan-600/30
"

>


<p className="
font-semibold
text-cyan-400
">

{item.judul}

</p>



<p className="
text-gray-400
mt-1
">

{
item.mulai.toLocaleTimeString(
"id-ID",
{
hour:"2-digit",
minute:"2-digit"
}
)
}

</p>



</Link>


))


}



</div>







</div>


)

})


}





</div>






</div>








</div>

)

}