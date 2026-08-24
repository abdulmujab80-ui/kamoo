import {
  FileText,
  Clock3,
  CheckCircle2,
  Wallet,
  CalendarDays,
  Info
} from "lucide-react";


import { prisma } from "@/lib/prisma";


import CardStat from "@/components/cardstat";
import QuickMenu from "@/components/quickmenu";





export default async function DashboardUser({

user

}:{
user:any
}){





const [

suratSaya,

suratDiproses,

suratSelesai,

reimburseSaya,

jadwalTerbaru

] = await Promise.all([




prisma.pengajuanSurat.count({

where:{
userId:user.id
}

}),




prisma.pengajuanSurat.count({

where:{

userId:user.id,

status:"DIPROSES"

}

}),





prisma.pengajuanSurat.count({

where:{

userId:user.id,

status:"SELESAI"

}

}),





prisma.reimburse.count({

where:{
userId:user.id
}

}),





prisma.jadwal.findMany({

orderBy:{
mulai:"asc"
},

take:5

})



]);








return (


<div className="space-y-10">







{/* HEADER */}


<div>


<h1

className="
text-3xl
font-bold
"

>

Selamat datang, {user.nama}

</h1>



<p

className="
mt-2
text-slate-400
"

>

Dashboard Anggota Organisasi

</p>



</div>









{/* HERO */}


<section

className="
relative
overflow-hidden
rounded-3xl
border
border-white/10
bg-gradient-to-br
from-[#10243f]
to-[#07111f]
p-8
"

>


<div

className="
absolute
right-10
top-10
h-32
w-32
rounded-full
bg-cyan-400/10
blur-3xl
"

/>




<h2

className="
text-xl
font-semibold
"

>

Aktivitas Organisasi

</h2>



<p

className="
mt-3
max-w-2xl
text-slate-300
leading-relaxed
"

>

Pantau pengajuan surat, status administrasi,
reimburse, dan agenda kegiatan organisasi melalui satu dashboard.

</p>




</section>









{/* STAT CARD */}


<section>


<div

className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-6
"

>



<CardStat

title="Pengajuan Surat"

value={suratSaya}

icon={<FileText size={24}/>}

description="Total pengajuan saya"

color="cyan"

/>





<CardStat

title="Sedang Diproses"

value={suratDiproses}

icon={<Clock3 size={24}/>}

description="Menunggu keputusan"

color="orange"

/>





<CardStat

title="Surat Selesai"

value={suratSelesai}

icon={<CheckCircle2 size={24}/>}

description="Sudah selesai"

color="green"

/>





<CardStat

title="Reimburse"

value={reimburseSaya}

icon={<Wallet size={24}/>}

description="Pengajuan biaya"

color="purple"

/>



</div>


</section>









{/* QUICK MENU */}

<QuickMenu/>









{/* AGENDA */}


<section

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
flex
items-center
gap-3
mb-6
"

>


<CalendarDays

className="
text-cyan-400
"

/>


<h2

className="
text-xl
font-bold
"

>

Agenda Mendatang

</h2>


</div>







{

jadwalTerbaru.length===0

?


<p

className="
text-slate-400
"

>

Belum ada agenda kegiatan

</p>


:


<div

className="
space-y-4
"

>


{

jadwalTerbaru.map((item)=>(


<div

key={item.id}

className="
rounded-xl
border
border-white/10
bg-white/[0.03]
p-5
transition
hover:bg-white/[0.06]
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
"

>

{item.judul}

</h3>


<p

className="
mt-1
text-sm
text-slate-400
"

>

{item.lokasi || "Lokasi belum ditentukan"}

</p>


</div>





<p

className="
text-sm
text-cyan-400
"

>

{

item.mulai.toLocaleDateString(
"id-ID"
)

}

</p>



</div>


</div>


))


}



</div>


}



</section>









{/* INFO */}


<section

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
flex
gap-4
"

>


<div

className="
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-cyan-500/10
text-cyan-400
"

>


<Info size={22}/>


</div>





<div>


<h3

className="
font-semibold
"

>

Informasi Sistem

</h3>


<p

className="
mt-2
text-sm
text-slate-400
"

>

Gunakan menu pengajuan untuk kebutuhan administrasi organisasi.
Setiap pengajuan akan diproses oleh pengurus terkait.

</p>


</div>


</div>


</section>







</div>


)

}