import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import Link from "next/link";





async function updateUser(
formData: FormData
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




const id =
String(formData.get("id"));



const nama =
String(formData.get("nama"))
.trim();



const email =
String(formData.get("email"))
.toLowerCase()
.trim();



const role =
String(formData.get("role"));



const aktif =
String(formData.get("aktif"))
===
"true";



const password =
String(formData.get("password") || "");






const existing =
await prisma.user.findFirst({

where:{

email,

NOT:{
id
}

}

});




if(existing){

throw new Error(
"Email sudah digunakan"
);

}






let updateData:any={


nama,

email,

role:role as any,

aktif

};







if(password){

if(password.length < 6){

throw new Error(
"Password minimal 6 karakter"
);

}



updateData.password =
await bcrypt.hash(
password,
10
);


}









const user =
await prisma.user.update({

where:{
id
},

data:updateData

});







await prisma.auditLog.create({

data:{


userId:String(session.id),


aktivitas:
`Mengubah data pengguna ${user.nama}`


}

});








revalidatePath("/pengguna");

revalidatePath(
`/pengguna/${id}`
);


redirect(
`/pengguna/${id}`
);



}









export default async function EditUser({

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




if(session.role !== "SUPERADMIN"){

redirect("/dashboard");

}







const user =
await prisma.user.findUnique({

where:{
id:params.id
}

});





if(!user){

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

Edit Pengguna

</h1>


<p className="
text-gray-400
mt-2
">

Kelola informasi dan hak akses pengguna

</p>


</div>





<Link

href={`/pengguna/${user.id}`}

className="
bg-slate-700
px-5
py-3
rounded-lg
"

>

← Kembali

</Link>



</div>









<form

action={updateUser}

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



<input

type="hidden"

name="id"

value={user.id}

/>







<div>

<label className="
text-gray-300
">

Nama Lengkap

</label>


<input

name="nama"

defaultValue={user.nama}

required

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

<label className="
text-gray-300
">

Email

</label>


<input

type="email"

name="email"

defaultValue={user.email}

required

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

<label className="
text-gray-300
">

Role

</label>


<select

name="role"

defaultValue={user.role}

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








<div>

<label className="
text-gray-300
">

Status Akun

</label>


<select

name="aktif"

defaultValue={
String(user.aktif)
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

>


<option value="true">
Aktif
</option>


<option value="false">
Nonaktif
</option>



</select>



</div>









<div>

<label className="
text-gray-300
">

Reset Password
<span className="
text-gray-500
text-sm
"
>
 (opsional)
</span>

</label>


<input

type="password"

name="password"

placeholder="Kosongkan jika tidak ingin mengganti"

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

Simpan Perubahan

</button>




<Link

href={`/pengguna/${user.id}`}

className="
bg-slate-700
px-6
py-3
rounded-lg
"

>

Batal

</Link>



</div>






</form>






</div>

)

}