import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";



async function tambahSurat(
formData:FormData
){

"use server";



const session = await getSession();


if(!session){

redirect("/login");

}



await prisma.suratMasuk.create({

data:{


nomorSurat:
String(
formData.get("nomorSurat")
),


tanggalSurat:
new Date(
String(
formData.get("tanggalSurat")
)
),


asal:
String(
formData.get("asal")
),


perihal:
String(
formData.get("perihal")
),


fileUrl:
String(
formData.get("fileUrl")
)

}


});



revalidatePath("/surat-masuk");


redirect("/surat-masuk");


}







export default async function TambahSuratMasuk(){



const session = await getSession();


if(!session){

redirect("/login");

}




return (

<div className="p-8">


<h1 className="
text-3xl
font-bold
mb-2
">

Tambah Surat Masuk

</h1>


<p className="
text-gray-400
mb-8
">

Input arsip surat masuk

</p>






<form

action={tambahSurat}

className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
max-w-xl
space-y-5
"

>



<div>

<label>
Nomor Surat
</label>

<input

name="nomorSurat"

required

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
"

/>

</div>






<div>

<label>
Tanggal Surat
</label>

<input

type="date"

name="tanggalSurat"

required

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
"

/>

</div>







<div>

<label>
Asal Surat
</label>

<input

name="asal"

required

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
"

/>

</div>







<div>

<label>
Perihal
</label>

<textarea

name="perihal"

required

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
"

/>

</div>







<div>

<label>
URL File

</label>

<input

name="fileUrl"

placeholder="https://..."

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
"

/>

</div>






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

Simpan

</button>




</form>


</div>

)


}