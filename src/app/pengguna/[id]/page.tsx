import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";



function Badge({
children,
color
}:{
children:React.ReactNode,
color:string
}){

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

{children}

</span>

)

}





export default async function DetailUser({

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



if(session.role !== "SUPERADMIN"){

redirect("/dashboard");

}




const user =
await prisma.user.findUnique({

where:{
id:params.id
},

include:{

audit:{
orderBy:{
createdAt:"desc"
},

take:10

}

}

});





if(!user){

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

Detail Pengguna

</h1>


<p className="
text-gray-400
mt-2
">

Informasi akun pengguna organisasi

</p>


</div>





<Link

href="/pengguna"

className="
bg-slate-700
px-5
py-3
rounded-lg
"

>

← Kembali

</Link>



</div>









<div className="
grid
grid-cols-1
lg:grid-cols-2
gap-6
">







<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
space-y-5
">



<h2 className="
text-xl
font-bold
mb-5
">

Profil Pengguna

</h2>




<div>

<p className="text-gray-400">

Nama

</p>

<p className="font-semibold">

{user.nama}

</p>

</div>






<div>

<p className="text-gray-400">

Email

</p>

<p>

{user.email}

</p>

</div>







<div>

<p className="text-gray-400">

Role

</p>


<Badge
color="
bg-purple-500/20
text-purple-400
"
>

{user.role}

</Badge>


</div>







<div>

<p className="text-gray-400">

Status

</p>


<Badge

color={
user.aktif
?
"bg-green-500/20 text-green-400"
:
"bg-red-500/20 text-red-400"
}

>

{
user.aktif
?
"Aktif"
:
"Nonaktif"
}

</Badge>


</div>








<div>

<p className="text-gray-400">

Tanggal dibuat

</p>


<p>

{
user.createdAt.toLocaleDateString(
"id-ID"
)
}

</p>


</div>







<div className="
pt-5
border-t
border-slate-800
">


<Link

href={`/pengguna/${user.id}/edit`}

className="
bg-cyan-600
px-5
py-3
rounded-lg
font-semibold
"

>

Edit Pengguna

</Link>


</div>




</div>









<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
">


<h2 className="
text-xl
font-bold
mb-5
">

Aktivitas Terakhir

</h2>




{

user.audit.length===0

?

<p className="text-gray-400">

Belum ada aktivitas

</p>


:

user.audit.map((log)=>(


<div

key={log.id}

className="
border-b
border-slate-800
py-4
"

>


<p>

{log.aktivitas}

</p>


<p className="
text-xs
text-gray-500
mt-2
">

{
log.createdAt.toLocaleString(
"id-ID"
)
}

</p>


</div>


))

}




</div>






</div>







</div>

)

}