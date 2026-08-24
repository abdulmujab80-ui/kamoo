import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";



async function tambahSuratKeluar(
formData:FormData
){

"use server";


const session = await getSession();


if(!session){
redirect("/login");
}



await prisma.suratKeluar.create({

data:{


nomorSurat:
String(
formData.get("nomorSurat")
),



tujuan:
String(
formData.get("tujuan")
),



perihal:
String(
formData.get("perihal")
),



tanggalSurat:
new Date(
String(
formData.get("tanggalSurat")
)
),



fileUrl:
formData.get("fileUrl")
?
String(formData.get("fileUrl"))
:
null



}


});



revalidatePath("/surat/keluar");


redirect("/surat/keluar");


}









export default async function TambahSuratKeluar(){


const session = await getSession();


if(!session){
redirect("/login");
}




return (

<div className="p-8">



<div className="
mb-8
">


<h1 className="
text-3xl
font-bold
">

Buat Surat Keluar

</h1>


<p className="
text-gray-400
mt-2
">

Pembuatan surat resmi organisasi KAMOO

</p>


</div>








<form

action={tambahSuratKeluar}

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


<label className="block mb-2">

Nomor Surat

</label>


<input

name="nomorSurat"

required

placeholder="Contoh: SK/001/KAMOO/VIII/2026"

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

Tujuan Surat

</label>


<input

name="tujuan"

required

placeholder="Contoh: Universitas / Instansi"

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

Perihal

</label>


<input

name="perihal"

required

placeholder="Perihal surat"

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

Tanggal Surat

</label>


<input

type="date"

name="tanggalSurat"

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

Link File Surat (Opsional)

</label>


<input

name="fileUrl"

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

Simpan Surat

</button>





<a

href="/surat/keluar"

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