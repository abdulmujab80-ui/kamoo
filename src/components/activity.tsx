import {
  CheckCircle2,
  Clock3,
  CalendarDays,
  FileText,
  Wallet,
} from "lucide-react";



const activities = [

{
title:"Surat Perjalanan Dinas",

description:
"Ahmad mengajukan surat baru",

status:"Menunggu",

time:"Baru saja",

icon:
<FileText size={18}/>,

color:
"yellow"

},


{
title:"Reimburse Transportasi",

description:
"Pengajuan biaya kegiatan telah diproses",

status:"Disetujui",

time:"2 jam lalu",

icon:
<Wallet size={18}/>,

color:
"green"

},


{
title:"Rapat Pengurus",

description:
"Agenda kegiatan organisasi ditambahkan",

status:"Terjadwal",

time:"Kemarin",

icon:
<CalendarDays size={18}/>,

color:
"blue"

}


];







export default function Activity(){



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

Aktivitas Terbaru

</h2>


<p

className="
text-sm
text-slate-400
mt-1
"

>

Riwayat aktivitas organisasi terbaru

</p>


</div>








<div

className="
rounded-2xl
border
border-white/10
bg-[#0b1628]
p-6
"

>


<div

className="
relative
space-y-6
"

>


{/* LINE */}

<div

className="
absolute
left-5
top-5
bottom-5
w-px
bg-white/10
"

/>





{

activities.map((item,index)=>(


<div

key={index}

className="
relative
flex
gap-5
group
"

>


{/* ICON */}

<div

className={`
relative
z-10
flex
h-10
w-10
items-center
justify-center
rounded-full
bg-[#111d32]
border
border-white/10

${
item.color==="yellow"
?
"text-yellow-400"
:
item.color==="green"
?
"text-emerald-400"
:
"text-blue-400"
}

transition
duration-300
group-hover:scale-110

`}

>

{item.icon}


</div>








{/* CONTENT */}

<div

className="
flex-1
rounded-xl
border
border-white/5
bg-white/[0.03]
p-4
transition
duration-300
group-hover:bg-white/[0.06]
"

>


<div

className="
flex
justify-between
gap-4
"

>


<div>


<h3

className="
font-semibold
text-white
"

>

{item.title}

</h3>


<p

className="
mt-1
text-sm
text-slate-400
"

>

{item.description}

</p>


</div>







<span

className={`
text-xs
font-medium

${
item.color==="yellow"
?
"text-yellow-400"
:
item.color==="green"
?
"text-emerald-400"
:
"text-blue-400"
}

`}

>

{item.status}

</span>



</div>





<div

className="
mt-3
flex
items-center
gap-2
text-xs
text-slate-500
"

>


<Clock3 size={13}/>


{item.time}


</div>




</div>





</div>


))


}



</div>



</div>




</section>


)

}