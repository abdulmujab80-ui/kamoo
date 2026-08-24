import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";





async function tambahJadwal(
formData:FormData
){

"use server";



const session =
await getSession();



if(!session){

redirect("/login");

}





const tanggalMulai =
String(
formData.get("mulai")
);



const jamMulai =
String(
formData.get("jamMulai")
);




const tanggalSelesai =
String(
formData.get("selesai")
);



const jamSelesai =
String(
formData.get("jamSelesai")
);






const mulai =
new Date(
`${tanggalMulai}T${jamMulai}`
);




const selesai =
new Date(
`${tanggalSelesai}T${jamSelesai}`
);







await prisma.jadwal.create({

data:{


judul:
String(
formData.get("judul")
),



deskripsi:
formData.get("deskripsi")
?
String(
formData.get("deskripsi")
)
:
null,



lokasi:
formData.get("lokasi")
?
String(
formData.get("lokasi")
)
:
null,



mulai,


selesai


}

});






revalidatePath("/jadwal");


redirect("/jadwal");


}










export default async function TambahJadwal(){



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

Tambah Kegiatan

</h1>


<p className="
text-gray-400
mt-2
">

Buat agenda baru organisasi KAMOO

</p>


</div>









<form

action={tambahJadwal}

className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
max-w-3xl
space-y-6
"

>







<div>


<label className="
block
mb-2
">

Nama Kegiatan

</label>


<input

name="judul"

required

placeholder="Contoh: Rapat Pengurus Bulanan"

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
">

Deskripsi

</label>


<textarea

name="deskripsi"

rows={4}

placeholder="Detail kegiatan"

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
">

Lokasi

</label>


<input

name="lokasi"

placeholder="Contoh: Ruang Rapat Organisasi"

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
">

Tanggal Mulai

</label>


<input

type="date"

name="mulai"

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


<label className="
block
mb-2
">

Jam Mulai

</label>


<input

type="time"

name="jamMulai"

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
">

Tanggal Selesai

</label>


<input

type="date"

name="selesai"

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


<label className="
block
mb-2
">

Jam Selesai

</label>


<input

type="time"

name="jamSelesai"

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

Simpan Jadwal

</button>







<a

href="/jadwal"

className="
bg-slate-700
hover:bg-slate-600
px-6
py-3
rounded-lg
"

>

Kembali

</a>





</div>







</form>








</div>

)

}