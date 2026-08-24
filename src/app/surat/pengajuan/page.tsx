import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";



async function submitPengajuan(
formData:FormData
){

"use server";



const session = await getSession();



if(!session?.id){

redirect("/login");

}



const jenis =
String(formData.get("jenis") || "");


const tujuan =
String(formData.get("tujuan") || "");


const keperluan =
String(formData.get("keperluan") || "");



const tanggalMulai =
formData.get("tanggalMulai")
?
new Date(
String(formData.get("tanggalMulai"))
)
:null;



const tanggalSelesai =
formData.get("tanggalSelesai")
?
new Date(
String(formData.get("tanggalSelesai"))
)
:null;





if(
!jenis ||
!tujuan ||
!keperluan
){

throw new Error(
"Data pengajuan belum lengkap"
);

}





await prisma.pengajuanSurat.create({

data:{


userId:String(session.id),


jenis,


tujuan,


keperluan,


tanggalMulai,


tanggalSelesai,


status:"DIAJUKAN"


}


});





revalidatePath("/surat");


redirect("/surat");


}








export default async function PengajuanSurat(){



const session = await getSession();



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

Ajukan Surat

</h1>


<p className="
text-gray-400
mt-2
">

Form pengajuan surat organisasi KAMOO

</p>


</div>





<form

action={submitPengajuan}

className="
max-w-3xl
bg-slate-900
border
border-slate-800
rounded-xl
p-8
space-y-6
"

>




<div>


<label className="
block
mb-2
font-medium
">

Jenis Surat

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


<option value="Surat Izin">
Surat Izin
</option>


<option value="Surat Perjalanan Dinas">
Surat Perjalanan Dinas
</option>


<option value="Surat Kegiatan">
Surat Kegiatan
</option>


<option value="Surat Keterangan">
Surat Keterangan
</option>



</select>



</div>







<div>


<label className="
block
mb-2
font-medium
">

Tujuan Surat

</label>


<input

name="tujuan"

required

placeholder="
Contoh: Ketua Organisasi
"

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


<label className="
block
mb-2
font-medium
">

Keperluan

</label>



<textarea


name="keperluan"


required


rows={5}


placeholder="
Jelaskan keperluan pengajuan surat
"


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
grid
grid-cols-2
gap-5
">



<div>


<label className="
block
mb-2
font-medium
">

Tanggal Mulai

</label>



<input

type="date"

name="tanggalMulai"


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


<label className="
block
mb-2
font-medium
">

Tanggal Selesai

</label>



<input

type="date"

name="tanggalSelesai"


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




</div>








<button

type="submit"

className="
bg-cyan-600
hover:bg-cyan-700
px-6
py-3
rounded-lg
font-semibold
transition
"

>

Kirim Pengajuan

</button>







</form>




</div>


)

}