"use client";


import Link from "next/link";
import { useState } from "react";
import { 
  X,
  LayoutDashboard,
  Inbox,
  Send,
  FileText,
  ClipboardCheck,
  Wallet,
  Receipt,
  BarChart3,
  CalendarDays,
  FolderOpen,
  Users,
  Settings
} from "lucide-react";

import Logout from "./logout";





const menus = [

{
title:"Dashboard",
href:"/dashboard",
icon:<LayoutDashboard size={18}/>
},


{
title:"Surat Masuk",
href:"/surat/masuk",
icon:<Inbox size={18}/>
},


{
title:"Surat Keluar",
href:"/surat/keluar",
icon:<Send size={18}/>
},


{
title:"Pengajuan Surat",
href:"/surat/pengajuan",
icon:<FileText size={18}/>
},


{
title:"Approval",
href:"/approval",
icon:<ClipboardCheck size={18}/>
},


{
title:"Keuangan",
href:"/keuangan",
icon:<Wallet size={18}/>
},


{
title:"Reimburse",
href:"/keuangan/reimburse",
icon:<Receipt size={18}/>
},


{
title:"Laporan",
href:"/keuangan/laporan",
icon:<BarChart3 size={18}/>
},


{
title:"Jadwal",
href:"/jadwal",
icon:<CalendarDays size={18}/>
},


{
title:"Dokumen",
href:"/dokumen",
icon:<FolderOpen size={18}/>
},


{
title:"Pengguna",
href:"/pengguna",
icon:<Users size={18}/>
},


{
title:"Pengaturan",
href:"/pengaturan",
icon:<Settings size={18}/>
}

];







export default function MobileMenu(){


const [open,setOpen]=useState(false);



return (

<>


<button

onClick={()=>setOpen(true)}

className="
lg:hidden
fixed
top-5
left-4
z-[60]
h-10
w-10
rounded-xl
bg-[#10243f]
flex
items-center
justify-center
"

>

☰

</button>






{

open &&

<div

className="
fixed
inset-0
z-50
bg-black/60
backdrop-blur-sm
lg:hidden
"

onClick={()=>setOpen(false)}

>





<aside

onClick={(e)=>e.stopPropagation()}

className="
absolute
left-0
top-0
h-full
w-72
bg-[#061426]
border-r
border-white/10
p-6
"

>



<div

className="
flex
justify-between
items-start
mb-10
"

>


<div>

<h1 className="
text-3xl
font-bold
">

KAMOO

</h1>


<p className="
text-xs
text-slate-400
mt-2
">

KATI Manajemen Operasional Organisasi

</p>

</div>




<button

onClick={()=>setOpen(false)}

>

<X size={22}/>

</button>



</div>








<nav className="
space-y-2
">




{

menus.map((item)=>(


<Link

key={item.href}

href={item.href}

onClick={()=>setOpen(false)}

className="
flex
items-center
gap-3
rounded-xl
px-4
py-3
text-slate-300
hover:bg-white/10
hover:text-white
transition
"

>

{item.icon}

<span>

{item.title}

</span>


</Link>


))


}







<div

className="
border-t
border-white/10
mt-8
pt-5
"

>

<Logout/>

</div>





</nav>




</aside>



</div>



}



</>


)

}