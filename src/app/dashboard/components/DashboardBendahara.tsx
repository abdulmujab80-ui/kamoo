import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ReceiptText,
  ClipboardCheck,
  FileSpreadsheet,
  PlusCircle,
  BarChart3,
  ShieldCheck
} from "lucide-react";


import { prisma } from "@/lib/prisma";


import CardStat from "@/components/cardstat";
import Activity from "@/components/activity";





export default async function DashboardBendahara({

user

}:{

user:any

}){





const [

totalMasuk,

totalKeluar,

totalReimburse,

menungguApproval

] = await Promise.all([




prisma.keuangan.aggregate({

where:{
jenis:"MASUK"
},

_sum:{
jumlah:true
}

}),





prisma.keuangan.aggregate({

where:{
jenis:"KELUAR"
},

_sum:{
jumlah:true
}

}),






prisma.reimburse.count(),





prisma.reimburse.count({

where:{
status:"MENUNGGU"
}

})



]);








const pemasukan =
totalMasuk._sum.jumlah ?? 0;


const pengeluaran =
totalKeluar._sum.jumlah ?? 0;


const saldo =
pemasukan - pengeluaran;







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

ADMIN BENDAHARA • Pengelolaan Keuangan Organisasi

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
h-36
w-36
rounded-full
bg-emerald-400/10
blur-3xl
"

/>





<h2

className="
text-xl
font-semibold
"

>

Dashboard Keuangan

</h2>



<p

className="
mt-3
max-w-3xl
text-slate-300
leading-relaxed
"

>

Kelola transaksi, reimburse, dan laporan keuangan
organisasi secara transparan dan terstruktur.

</p>




<div

className="
mt-6
flex
items-center
gap-2
text-emerald-400
text-sm
"

>


<ShieldCheck size={18}/>

Sistem Keuangan Aktif


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

title="Saldo"

value={`Rp ${saldo.toLocaleString("id-ID")}`}

icon={<Wallet size={24}/>}

description="Saldo berjalan"

color="cyan"

/>





<CardStat

title="Pemasukan"

value={`Rp ${pemasukan.toLocaleString("id-ID")}`}

icon={<ArrowDownCircle size={24}/>}

description="Total dana masuk"

color="green"

/>





<CardStat

title="Pengeluaran"

value={`Rp ${pengeluaran.toLocaleString("id-ID")}`}

icon={<ArrowUpCircle size={24}/>}

description="Total dana keluar"

color="orange"

/>





<CardStat

title="Reimburse Pending"

value={menungguApproval}

icon={<ClipboardCheck size={24}/>}

description="Menunggu verifikasi"

color="purple"

/>



</div>


</section>









{/* QUICK ACTION */}


<section>


<div

className="
mb-5
"

>


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

Menu pengelolaan keuangan

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

href="/keuangan/transaksi/tambah"

icon={<PlusCircle size={22}/>}

title="Tambah Transaksi"

desc="Input transaksi keuangan"

/>





<ActionCard

href="/keuangan/reimburse"

icon={<ReceiptText size={22}/>}

title="Reimburse"

desc="Kelola pengajuan biaya"

/>





<ActionCard

href="/keuangan/laporan"

icon={<FileSpreadsheet size={22}/>}

title="Laporan"

desc="Lihat laporan keuangan"

/>





<ActionCard

href="/keuangan"

icon={<BarChart3 size={22}/>}

title="Dashboard"

desc="Monitoring keuangan"

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
text-emerald-400
transition
group-hover:scale-110
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