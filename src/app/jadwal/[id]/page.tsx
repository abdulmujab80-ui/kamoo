import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";





async function hapusJadwal(
formData:FormData
){

"use server";



const session =
await getSession();



if(!session){

redirect("/login");

}





const id =
String(
formData.get("id")
);





await prisma.jadwal.delete({

where:{
id
}

});





revalidatePath("/jadwal");


redirect("/jadwal");


}









async function updateJadwal(
formData:FormData
){

"use server";



const session =
await getSession();



if(!session){

redirect("/login");

}





const id =
String(
formData.get("id")
);




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







await prisma.jadwal.update({

where:{
id
},


data:{


judul:
String(
formData.get("judul")
),



deskripsi:
String(
formData.get("deskripsi")
),



lokasi:
String(
formData.get("lokasi")
),



mulai:
new Date(
`${tanggalMulai}T${jamMulai}`
),



selesai:
new Date(
`${tanggalSelesai}T${jamSelesai}`
)



}

});







revalidatePath("/jadwal");

revalidatePath(`/jadwal/${id}`);



}









export default async function DetailJadwal({

params

}:{

params:{
id:string
}

}){



const session =
await getSession();



if(!session){

redirect("/login");

}





const jadwal =
await prisma.jadwal.findUnique({

where:{
id:params.id
}

});





if(!jadwal){

notFound();

}







return (

<div className="p-8">





<div className="
flex
justify-between
items-center
mb-8
">


<div>


<h1 className="
text-3xl
font-bold
">

Detail Kegiatan

</h1>


<p className="
text-gray-400
mt-2
">

Informasi agenda organisasi KAMOO

</p>


</div>





<Link

href="/jadwal"

className="
bg-slate-800
px-5
py-3
rounded-lg
"

>

← Kembali

</Link>



</div>









<div className="
bg-slate-900
border
border-slate-800
rounded-xl
p-8
space-y-6
">









<form

action={updateJadwal}

className="space-y-5"

>




<input

type="hidden"

name="id"

value={jadwal.id}

/>







<div>


<label>

Nama Kegiatan

</label>


<input

name="judul"

defaultValue={jadwal.judul}

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>








<div>


<label>

Deskripsi

</label>


<textarea

name="deskripsi"

defaultValue={
jadwal.deskripsi || ""
}

rows={4}

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>








<div>


<label>

Lokasi

</label>


<input

name="lokasi"

defaultValue={
jadwal.lokasi || ""
}

className="
w-full
mt-2
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


<label>

Tanggal Mulai

</label>


<input

type="date"

name="mulai"

defaultValue={
jadwal.mulai.toISOString().split("T")[0]
}

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>







<div>


<label>

Jam Mulai

</label>


<input

type="time"

name="jamMulai"

defaultValue={
jadwal.mulai
.toISOString()
.substring(11,16)
}

className="
w-full
mt-2
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


<label>

Tanggal Selesai

</label>


<input

type="date"

name="selesai"

defaultValue={
jadwal.selesai.toISOString().split("T")[0]
}

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

/>


</div>







<div>


<label>

Jam Selesai

</label>


<input

type="time"

name="jamSelesai"

defaultValue={
jadwal.selesai
.toISOString()
.substring(11,16)
}

className="
w-full
mt-2
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

className="
bg-cyan-600
hover:bg-cyan-700
px-6
py-3
rounded-lg
font-semibold
"

>

Simpan Perubahan

</button>





</form>









<div className="
border-t
border-slate-800
pt-6
">


<form action={hapusJadwal}>


<input

type="hidden"

name="id"

value={jadwal.id}

/>



<button

className="
bg-red-600
hover:bg-red-700
px-6
py-3
rounded-lg
font-semibold
"

>

Hapus Kegiatan

</button>



</form>



</div>








</div>







</div>

)

}