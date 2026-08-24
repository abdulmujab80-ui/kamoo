import { prisma } from "@/lib/prisma";
import Link from "next/link";


function RoleBadge({
role
}:{
role:string
}){


const color:any={

SUPERADMIN:
"bg-purple-500/20 text-purple-400",

ADMIN_SEKRETARIS:
"bg-blue-500/20 text-blue-400",

ADMIN_BENDAHARA:
"bg-green-500/20 text-green-400",

PENGURUS:
"bg-yellow-500/20 text-yellow-400",

ANGGOTA:
"bg-gray-500/20 text-gray-300"

};


return (

<span
className={`
px-3
py-1
rounded-full
text-sm
${color[role]}
`}
>

{role}

</span>

)

}





function StatusBadge({
aktif
}:{
aktif:boolean
}){


return (

<span
className={`
px-3
py-1
rounded-full
text-sm
${
aktif
?
"bg-green-500/20 text-green-400"
:
"bg-red-500/20 text-red-400"
}
`}
>

{
aktif
?
"Aktif"
:
"Nonaktif"
}

</span>

)

}





export default async function PenggunaPage(){



const users =
await prisma.user.findMany({

orderBy:{
createdAt:"desc"
}

});





return (

<div className="p-8">



<div
className="
flex
justify-between
items-center
mb-8
"
>


<div>

<h1
className="
text-3xl
font-bold
"
>

Manajemen Pengguna

</h1>


<p
className="
text-gray-400
mt-2
"
>

Kelola akun organisasi KAMOO

</p>


</div>





<Link

href="/pengguna/tambah"

className="
bg-cyan-600
hover:bg-cyan-700
px-5
py-3
rounded-lg
font-semibold
"

>

+ Tambah Pengguna

</Link>



</div>









<div
className="
bg-slate-900
border
border-slate-800
rounded-xl
overflow-hidden
"
>



<table
className="
w-full
"
>


<thead
className="
bg-slate-800
"
>


<tr>


<th className="p-4 text-left">
Nama
</th>


<th className="p-4 text-left">
Email
</th>


<th className="p-4 text-left">
Role
</th>


<th className="p-4 text-left">
Status
</th>


<th className="p-4 text-left">
Tanggal Daftar
</th>


<th className="p-4 text-left">
Aksi
</th>


</tr>


</thead>







<tbody>


{
users.length===0

?


<tr>

<td
colSpan={6}
className="
p-8
text-center
text-gray-400
"
>

Belum ada pengguna

</td>

</tr>


:


users.map((user)=>(


<tr

key={user.id}

className="
border-t
border-slate-800
hover:bg-white/5
"

>


<td
className="
p-4
font-semibold
"
>

{user.nama}

</td>




<td
className="
p-4
"
>

{user.email}

</td>




<td
className="
p-4
"
>

<RoleBadge
role={user.role}
/>

</td>




<td
className="
p-4
"
>

<StatusBadge
aktif={user.aktif}
/>

</td>





<td
className="
p-4
"
>

{
user.createdAt.toLocaleDateString(
"id-ID"
)
}

</td>






<td
className="
p-4
"
>


<div
className="
flex
gap-2
"
>


<Link

href={`/pengguna/${user.id}`}

className="
bg-slate-700
px-3
py-2
rounded-lg
text-sm
"

>

Detail

</Link>



<Link

href={`/pengguna/${user.id}/edit`}

className="
bg-cyan-600
px-3
py-2
rounded-lg
text-sm
"

>

Edit

</Link>



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