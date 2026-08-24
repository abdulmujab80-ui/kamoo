import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";





async function tambahTransaksi(
formData:FormData
){

"use server";



const session =
await getSession();



if(!session){

redirect("/login");

}




if(
session.role !== "SUPERADMIN" &&
session.role !== "ADMIN_BENDAHARA"
){

redirect("/dashboard");

}






const jenis =
String(
formData.get("jenis")
);




await prisma.keuangan.create({

data:{


jenis: jenis as any,



keterangan:
String(
formData.get("keterangan")
),



jumlah:
Number(
formData.get("jumlah")
),



tanggal:
new Date(
String(
formData.get("tanggal")
)
),



buktiUrl:
formData.get("buktiUrl")
?
String(
formData.get("buktiUrl")
)
:
null



}

});






revalidatePath("/keuangan");

revalidatePath("/keuangan/laporan");



redirect("/keuangan");

}









export default async function TambahTransaksi(){



const session =
await getSession();



if(!session){

redirect("/login");

}





return (

<div className="p-8">





<div className="mb-8">


<h1 className="
text-3xl
font-bold
">

Tambah Transaksi

</h1>


<p className="
text-gray-400
mt-2
">

Input kas masuk dan kas keluar organisasi

</p>


</div>








<form

action={tambahTransaksi}

className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
max-w-2xl
space-y-6
"

>







<div>


<label className="block mb-2">

Jenis Transaksi

</label>


<select

name="jenis"

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

>


<option value="MASUK">

Kas Masuk

</option>



<option value="KELUAR">

Kas Keluar

</option>



</select>


</div>









<div>


<label className="block mb-2">

Keterangan

</label>


<textarea

name="keterangan"

required

rows={4}

placeholder="Contoh: Dana kegiatan organisasi"

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>









<div>


<label className="block mb-2">

Jumlah

</label>


<input

type="number"

name="jumlah"

required

placeholder="100000"

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>









<div>


<label className="block mb-2">

Tanggal

</label>


<input

type="date"

name="tanggal"

required

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>









<div>


<label className="block mb-2">

Bukti Transaksi

</label>


<input

name="buktiUrl"

placeholder="https://..."

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>









<div className="
flex
gap-4
pt-5
">


<button

className="
bg-cyan-600
hover:bg-cyan-700
px-6
py-3
rounded-lg
font-semibold
"

>

Simpan Transaksi

</button>




<a

href="/keuangan"

className="
bg-slate-700
px-6
py-3
rounded-lg
"

>

Batal

</a>



</div>







</form>





</div>

)

}