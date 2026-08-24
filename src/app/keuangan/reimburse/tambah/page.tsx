import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";





async function tambahReimburse(
formData:FormData
){

"use server";



const session =
await getSession();



if(!session){

redirect("/login");

}







await prisma.reimburse.create({

data:{


userId:String(session.id),



keterangan:
String(
formData.get("keterangan")
),



jumlah:
Number(
formData.get("jumlah")
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






revalidatePath(
"/keuangan/reimburse"
);



redirect(
"/keuangan/reimburse"
);



}










export default async function TambahReimburse(){



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

Ajukan Reimburse

</h1>


<p className="
text-gray-400
mt-2
">

Pengajuan penggantian biaya kegiatan organisasi

</p>


</div>








<form

action={tambahReimburse}

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

Keterangan

</label>


<textarea

name="keterangan"

required

rows={4}

placeholder="Contoh: Pembelian konsumsi rapat"

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


placeholder="50000"


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

Link Bukti Pembayaran

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


<p className="
text-sm
text-gray-500
mt-2
">

Sementara menggunakan URL. Nanti bisa diganti Supabase Storage.

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

Kirim Pengajuan

</button>





<a

href="/keuangan/reimburse"

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