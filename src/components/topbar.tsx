"use client";


import {
  Bell,
  Menu,
  UserCircle
} from "lucide-react";

import { usePathname } from "next/navigation";




export default function Topbar(){


const pathname = usePathname();



function getTitle(){


if(pathname.startsWith("/surat"))
return "Persuratan";


if(pathname.startsWith("/keuangan"))
return "Keuangan";


if(pathname.startsWith("/jadwal"))
return "Jadwal Kegiatan";


if(pathname.startsWith("/dokumen"))
return "Dokumen";


if(pathname.startsWith("/pengguna"))
return "Manajemen Pengguna";


return "Dashboard";


}





return (


<header

className="
sticky
top-0
z-40
h-20
border-b
border-white/10
bg-[#050b14]/90
backdrop-blur-xl
"

>


<div

className="
h-full
flex
items-center
justify-between
px-4
md:px-8
"

>



{/* LEFT */}


<div

className="
flex
items-center
gap-4
"

>


{/* MOBILE BUTTON */}

<button

className="
lg:hidden
flex
items-center
justify-center
h-10
w-10
rounded-xl
bg-white/5
hover:bg-white/10
transition
"

>


<Menu size={22}/>


</button>







<div>


<h1

className="
text-lg
md:text-xl
font-semibold
text-white
"

>

{getTitle()}

</h1>


<p

className="
hidden
md:block
text-sm
text-slate-400
mt-1
"

>

Sistem Manajemen Operasional KAMOO

</p>


</div>



</div>









{/* RIGHT */}


<div

className="
flex
items-center
gap-4
"

>





<button

className="
relative
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-white/5
text-slate-300
hover:text-white
hover:bg-white/10
transition
"

>


<Bell size={20}/>


<span

className="
absolute
right-2
top-2
h-2
w-2
rounded-full
bg-cyan-400
"

/>


</button>









<div

className="
hidden
sm:flex
items-center
gap-3
rounded-xl
bg-white/5
px-3
py-2
"

>


<UserCircle

size={34}

className="
text-cyan-400
"

/>


<div>


<p

className="
text-sm
font-medium
text-white
"

>

Administrator

</p>


<p

className="
text-xs
text-slate-400
"

>

SUPERADMIN

</p>


</div>


</div>








</div>





</div>


</header>


)

}