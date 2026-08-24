import Link from "next/link";

import {
  FilePlus2,
  WalletCards,
  CalendarDays,
  FileSearch,
  ArrowRight
} from "lucide-react";



const menus = [

{
title:"Ajukan Surat",
description:
"Permohonan surat organisasi dan kegiatan",

href:"/surat/pengajuan",

icon:<FilePlus2 size={24}/>,

color:
"cyan"

},


{
title:"Ajukan Reimburse",
description:
"Pengajuan penggantian biaya kegiatan",

href:"/keuangan/reimburse",

icon:<WalletCards size={24}/>,

color:
"green"

},


{
title:"Jadwal Kegiatan",
description:
"Lihat agenda organisasi",

href:"/jadwal",

icon:<CalendarDays size={24}/>,

color:
"purple"

},


{
title:"Status Surat",
description:
"Pantau proses pengajuan surat",

href:"/surat",

icon:<FileSearch size={24}/>,

color:
"orange"

}


];





export default function QuickMenu(){


return (

<section className="mt-10">



<div className="mb-5">


<h2

className="
text-xl
font-bold
text-white
"

>

Menu Cepat

</h2>


<p

className="
text-sm
text-slate-400
mt-1
"

>

Akses fitur utama organisasi

</p>


</div>







<div

className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-5
"

>


{

menus.map((item)=>(


<Link

key={item.title}

href={item.href}

className="
group
relative
overflow-hidden
rounded-2xl
border
border-white/10
bg-[#0b1628]
p-6
transition-all
duration-300
hover:-translate-y-1
hover:border-cyan-400/40
hover:shadow-xl
"

>


<div

className="
flex
items-start
justify-between
"

>


<div

className={`
flex
h-12
w-12
items-center
justify-center
rounded-xl
bg-white/5
transition
duration-300
group-hover:scale-110

${
item.color==="cyan"
?
"text-cyan-400"
:
item.color==="green"
?
"text-emerald-400"
:
item.color==="purple"
?
"text-purple-400"
:
"text-orange-400"
}

`}

>

{item.icon}

</div>





<ArrowRight

size={18}

className="
text-slate-500
transition
group-hover:text-white
group-hover:translate-x-1
"

/>


</div>








<h3

className="
mt-5
font-semibold
text-white
text-lg
"

>

{item.title}

</h3>





<p

className="
mt-2
text-sm
leading-relaxed
text-slate-400
"

>

{item.description}

</p>





</Link>


))

}


</div>





</section>


)

}