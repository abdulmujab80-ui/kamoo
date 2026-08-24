import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";





export default async function PengaturanPage(){



const session =
await getSession();



if(!session){

redirect("/login");

}







const user =
await prisma.user.findUnique({

where:{
id:String(session.id)
}

});







if(!user){

redirect("/login");

}









return (

<div className="p-8">







<div className="mb-8">


<h1 className="
text-3xl
font-bold
">

Pengaturan

</h1>


<p className="
text-gray-400
mt-2
">

Pengaturan akun dan sistem organisasi KAMOO

</p>


</div>









<div className="
grid
grid-cols-2
gap-6
">







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
mb-6
">

Profil Pengguna

</h2>







<div className="
space-y-5
">





<div>


<p className="
text-gray-400
text-sm
">

Nama

</p>


<p className="
font-semibold
">

{user.nama}

</p>


</div>







<div>


<p className="
text-gray-400
text-sm
">

Email

</p>


<p>

{user.email}

</p>


</div>








<div>


<p className="
text-gray-400
text-sm
">

Role

</p>


<span className="
inline-block
mt-2
px-3
py-1
rounded-full
bg-cyan-500/20
text-cyan-400
text-sm
">

{user.role}

</span>


</div>







<div>


<p className="
text-gray-400
text-sm
">

Status Akun

</p>


<span

className={`
inline-block
mt-2
px-3
py-1
rounded-full
text-sm
${
user.aktif
?
"bg-green-500/20 text-green-400"
:
"bg-red-500/20 text-red-400"
}
`}

>

{
user.aktif
?
"Aktif"
:
"Nonaktif"
}

</span>


</div>






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
mb-6
">

Pengaturan Sistem

</h2>







<div className="
space-y-6
">








<div className="
flex
justify-between
items-center
">




<div>


<p className="
font-semibold
">

Notifikasi

</p>


<p className="
text-sm
text-gray-400
">

Pemberitahuan aktivitas organisasi

</p>


</div>





<button

className="
w-12
h-6
rounded-full
bg-cyan-600
relative
"

>


<span

className="
absolute
right-1
top-1
w-4
h-4
bg-white
rounded-full
"

/>


</button>




</div>









<div className="
border-t
border-slate-800
pt-5
">



<p className="
font-semibold
mb-3
">

Keamanan Akun

</p>



<button

className="
bg-slate-700
hover:bg-slate-600
px-5
py-3
rounded-lg
"

>

Ubah Password

</button>



</div>









<div className="
border-t
border-slate-800
pt-5
">



<p className="
font-semibold
mb-2
">

Informasi Sistem

</p>



<p className="
text-gray-400
text-sm
">

KAMOO Management System

</p>


<p className="
text-gray-500
text-sm
">

Version 1.0

</p>



</div>







</div>







</div>








</div>







</div>

)

}