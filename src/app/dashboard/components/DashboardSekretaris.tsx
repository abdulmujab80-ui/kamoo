import {
  Inbox,
  Send,
  ClipboardCheck,
  FileText,
  FolderOpen,
  FilePlus2,
  ShieldCheck
} from "lucide-react";


import { prisma } from "@/lib/prisma";


import CardStat from "@/components/cardstat";
import Activity from "@/components/activity";





export default async function DashboardSekretaris({

user

}:{

user:any

}){





const [

suratMasuk,

suratKeluar,

menungguApproval,

totalDokumen

] = await Promise.all([




prisma.suratMasuk.count(),




prisma.suratKeluar.count(),




prisma.pengajuanSurat.count({

where:{
status:"DIAJUKAN"
}

}),




prisma.dokumen.count()



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

ADMIN SEKRETARIS • Pengelolaan Administrasi Organisasi

</p>


</div>









{/* HERO */}


<section

className="
rounded-3xl
border
border-white/10
bg-gradient-to-br
from-[#10243f]
to-[#07111f]
p-8
relative
overflow-hidden
"

>


<div

className="
absolute
right-10
top-10
h-36
w-36
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

Dashboard Sekretaris

</h2>




<p

className="
mt-3
text-slate-300
max-w-3xl
leading-relaxed
"

>

Kelola surat masuk, surat keluar, approval,
dan arsip administrasi organisasi secara terintegrasi.

</p>





<div

className="
mt-6
flex
items-center
gap-2
text-cyan-400
text-sm
"

>

<ShieldCheck size={18}/>

Sistem Administrasi Aktif


</div>


</section>









{/* STAT */}


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

title="Surat Masuk"

value={suratMasuk}

icon={<Inbox size={24}/>}

description="Surat diterima"

color="cyan"

/>






<CardStat

title="Surat Keluar"

value={suratKeluar}

icon={<Send size={24}/>}

description="Surat diterbitkan"

color="purple"

/>






<CardStat

title="Menunggu Review"

value={menungguApproval}

icon={<ClipboardCheck size={24}/>}

description="Perlu persetujuan"

color="orange"

/>






<CardStat

title="Arsip Dokumen"

value={totalDokumen}

icon={<FolderOpen size={24}/>}

description="Dokumen tersimpan"

color="green"

/>



</div>


</section>









{/* QUICK ACTION */}


<section>


<div className="
mb-5
">


<h2

className="
text-xl
font-bold
"

>

Aksi Cepat

</h2>


<p

className="
text-sm
text-slate-400
mt-1
"

>

Menu administrasi sekretaris

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





<ActionCard

href="/surat/masuk/tambah"

icon={<Inbox size={22}/>}

title="Input Surat Masuk"

desc="Catat surat yang diterima"

/>






<ActionCard

href="/surat/keluar/tambah"

icon={<FilePlus2 size={22}/>}

title="Buat Surat Keluar"

desc="Menerbitkan surat organisasi"

/>






<ActionCard

href="/approval"

icon={<ClipboardCheck size={22}/>}

title="Approval Surat"

desc="Review pengajuan surat"

/>






<ActionCard

href="/dokumen"

icon={<FolderOpen size={22}/>}

title="Arsip Dokumen"

desc="Kelola dokumen organisasi"

/>





</div>



</section>










<Activity/>







</div>

)

}









function ActionCard({

href,

icon,

title,

desc

}:{

href:string;

icon:React.ReactNode;

title:string;

desc:string;

}){


return (

<a

href={href}

className="
group
rounded-2xl
border
border-white/10
bg-[#0b1628]
p-6
transition
duration-300
hover:-translate-y-1
hover:bg-white/[0.05]
"

>


<div

className="
flex
h-12
w-12
items-center
justify-center
rounded-xl
bg-white/5
text-cyan-400
group-hover:scale-110
transition
"

>

{icon}

</div>




<h3

className="
mt-5
font-semibold
"

>

{title}

</h3>



<p

className="
mt-2
text-sm
text-slate-400
"

>

{desc}

</p>



</a>


)

}