import {
  Users,
  FileText,
  ClipboardCheck,
  FolderOpen,
  Wallet,
  CalendarDays,
  ShieldCheck
} from "lucide-react";


import CardStat from "@/components/cardstat";
import QuickMenu from "@/components/quickmenu";
import Activity from "@/components/activity";



import { prisma } from "@/lib/prisma";




export default async function DashboardSuperadmin({

user

}:{

user:any

}){



const [

totalUser,

totalSurat,

menungguApproval,

totalReimburse,

totalDokumen,

totalJadwal

] = await Promise.all([


prisma.user.count(),


prisma.pengajuanSurat.count(),


prisma.pengajuanSurat.count({

where:{
status:"DIAJUKAN"
}

}),


prisma.reimburse.count(),


prisma.dokumen.count(),


prisma.jadwal.count()


]);





return (


<div className="space-y-10">





{/* HEADER */}


<div>


<h1

className="
text-3xl
font-bold
text-white
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

SUPERADMIN • Manajemen Sistem Organisasi

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


<div className="
absolute
right-10
top-10
h-32
w-32
rounded-full
bg-cyan-400/10
blur-3xl
"/>



<h2

className="
text-xl
font-semibold
"

>

Quotes Hari Ini

</h2>



<p

className="
mt-4
max-w-3xl
text-lg
leading-relaxed
text-slate-300
"

>

"Organisasi yang kuat dibangun dari administrasi yang tertata dan sistem yang transparan."

</p>



<div

className="
mt-6
flex
items-center
gap-2
text-sm
text-cyan-400
"

>

<ShieldCheck size={18}/>

Sistem Operasional Aktif


</div>


</section>









{/* STATISTIC */}


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

title="Total Pengguna"

value={totalUser}

icon={<Users size={24}/>}

description="Akun organisasi aktif"

color="cyan"

/>





<CardStat

title="Pengajuan Surat"

value={totalSurat}

icon={<FileText size={24}/>}

description="Total surat masuk sistem"

color="purple"

/>





<CardStat

title="Menunggu Approval"

value={menungguApproval}

icon={<ClipboardCheck size={24}/>}

description="Perlu tindakan admin"

color="orange"

/>





<CardStat

title="Dokumen"

value={totalDokumen}

icon={<FolderOpen size={24}/>}

description="Arsip organisasi"

color="green"

/>



</div>


</section>









{/* QUICK MENU */}

<QuickMenu/>









{/* SUMMARY */}

<section

className="
grid
grid-cols-1
lg:grid-cols-3
gap-6
"

>


<div

className="
rounded-2xl
border
border-white/10
bg-[#0b1628]
p-6
"

>


<div className="
flex
items-center
gap-3
mb-5
">

<Wallet

className="
text-emerald-400
"

/>


<h3

className="
font-semibold
"

>

Keuangan

</h3>


</div>



<p className="
text-sm
text-slate-400
">

Total Reimburse

</p>


<p className="
mt-2
text-4xl
font-bold
"

>

{totalReimburse}

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


<div className="
flex
items-center
gap-3
mb-5
">

<CalendarDays

className="
text-purple-400
"

/>


<h3

className="
font-semibold
"

>

Agenda

</h3>


</div>



<p className="
text-sm
text-slate-400
">

Kegiatan organisasi

</p>


<p

className="
mt-2
text-4xl
font-bold
"

>

{totalJadwal}

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


<p

className="
text-sm
text-slate-400
"

>

Status Sistem

</p>


<div

className="
mt-5
flex
items-center
gap-3
"

>

<div

className="
h-3
w-3
rounded-full
bg-emerald-400
"

/>


<span

className="
text-emerald-400
font-medium
"

>

Online

</span>


</div>


</div>



</section>










{/* ACTIVITY */}


<Activity/>






</div>


)

}