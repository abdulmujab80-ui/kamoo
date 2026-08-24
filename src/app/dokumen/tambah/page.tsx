import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";





async function tambahDokumen(
formData:FormData
){

"use server";



const session =
await getSession();



if(!session){

redirect("/login");

}





await prisma.dokumen.create({

data:{


nama:
String(
formData.get("nama")
),



kategori:
String(
formData.get("kategori")
),



fileUrl:
String(
formData.get("fileUrl")
)


}

});







revalidatePath("/dokumen");


redirect("/dokumen");


}









export default async function TambahDokumen(){



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

Upload Dokumen

</h1>


<p className="
text-gray-400
mt-2
">

Tambah arsip dokumen organisasi KAMOO

</p>


</div>









<form

action={tambahDokumen}

className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
max-w-xl
space-y-6
"

>







<div>


<label className="
block
mb-2
">

Nama Dokumen

</label>


<input

name="nama"

required

placeholder="Contoh: AD ART Organisasi"

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
outline-none
"

 />


</div>









<div>


<label className="
block
mb-2
">

Kategori

</label>



<select

name="kategori"

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

>


<option value="Surat">

Surat

</option>


<option value="Proposal">

Proposal

</option>


<option value="Laporan">

Laporan

</option>


<option value="Arsip">

Arsip

</option>


<option value="Lainnya">

Lainnya

</option>


</select>



</div>









<div>


<label className="
block
mb-2
">

URL File

</label>


<input

name="fileUrl"

required

placeholder="https://drive.google.com/..."

className="
w-full
p-3
rounded-lg
bg-slate-800
border
border-slate-700
outline-none
"

/>


<p className="
text-sm
text-gray-500
mt-2
">

Gunakan link Google Drive / Storage.

</p>


</div>









<div className="
flex
gap-4
pt-4
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

Simpan Dokumen

</button>








<a

href="/dokumen"

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