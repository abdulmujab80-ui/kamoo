import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import Link from "next/link";



async function tambahUser(
formData:FormData
){

"use server";


const session =
await getSession();



if(!session){

redirect("/login");

}



if(session.role !== "SUPERADMIN"){

redirect("/dashboard");

}




const nama =
String(formData.get("nama")).trim();


const email =
String(formData.get("email"))
.toLowerCase()
.trim();


const password =
String(formData.get("password"));


const role =
String(formData.get("role"));





if(password.length < 6){

throw new Error(
"Password minimal 6 karakter"
);

}





const existingUser =
await prisma.user.findUnique({

where:{
email
}

});



if(existingUser){

throw new Error(
"Email sudah digunakan"
);

}







const hashPassword =
await bcrypt.hash(
password,
10
);







const user =
await prisma.user.create({

data:{


nama,


email,


password:hashPassword,


role:role as any,


aktif:true


}

});







await prisma.auditLog.create({

data:{


userId:String(session.id),


aktivitas:
`Membuat user baru ${user.nama} (${user.role})`


}

});







revalidatePath("/pengguna");


redirect("/pengguna");


}








export default async function TambahUser(){



const session =
await getSession();



if(!session){

redirect("/login");

}



if(session.role !== "SUPERADMIN"){

redirect("/dashboard");

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

Tambah Pengguna

</h1>


<p className="
text-gray-400
mt-2
">

Tambah akun pengguna dan atur hak akses organisasi

</p>


</div>










<form

action={tambahUser}

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
text-sm
text-gray-300
">

Nama Lengkap

</label>


<input

name="nama"

required

placeholder="Nama pengguna"

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
focus:outline-none
focus:border-cyan-500
"

/>


</div>







<div>

<label className="
text-sm
text-gray-300
">

Email

</label>


<input

type="email"

name="email"

required

placeholder="email@organisasi.com"

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
focus:outline-none
focus:border-cyan-500
"

/>


</div>







<div>

<label className="
text-sm
text-gray-300
">

Password

</label>


<input

type="password"

name="password"

required

placeholder="Minimal 6 karakter"

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
focus:outline-none
focus:border-cyan-500
"

/>


</div>







<div>

<label className="
text-sm
text-gray-300
">

Hak Akses / Role

</label>




<select

name="role"

defaultValue="ANGGOTA"

className="
w-full
mt-2
p-3
rounded-lg
bg-slate-800
border
border-slate-700
"

>


<option value="ANGGOTA">
Anggota
</option>


<option value="PENGURUS">
Pengurus
</option>


<option value="ADMIN_SEKRETARIS">
Admin Sekretaris
</option>


<option value="ADMIN_BENDAHARA">
Admin Bendahara
</option>


<option value="SUPERADMIN">
Superadmin
</option>


</select>



</div>








<div className="
flex
gap-4
pt-5
border-t
border-slate-800
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

Simpan Pengguna

</button>





<Link

href="/pengguna"

className="
bg-slate-700
hover:bg-slate-600
px-6
py-3
rounded-lg
font-semibold
"

>

Kembali

</Link>



</div>






</form>






</div>

)

}