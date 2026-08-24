import Link from "next/link";

import {
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







export default function Sidebar(){


return (

<aside

className="
hidden
lg:block
fixed
left-0
top-0
h-screen
w-72
bg-[#061426]
border-r
border-white/10
text-white
overflow-y-auto
z-50
"

>


<div className="
p-6
">





<div className="
mb-10
">


<h1

className="
text-3xl
font-bold
tracking-wide
"

>

KAMOO

</h1>



<p

className="
text-xs
text-slate-400
mt-3
leading-relaxed
"

>

KATI Manajemen Operasional Organisasi

</p>



</div>








<nav className="
space-y-2
">


{

menus.map((item)=>(


<Link

key={item.href}

href={item.href}

className="
flex
items-center
gap-3
px-4
py-3
rounded-xl
text-sm
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
mt-10
pt-5
"

>

<Logout/>

</div>





</nav>




</div>


</aside>


)

}