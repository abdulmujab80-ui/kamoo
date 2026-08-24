export default function Navbar({
  user
}:{
  user:any
}){


return (

<header className="
h-16
border-b
border-slate-800
flex
items-center
justify-between
px-8
">


<div>

<h2 className="font-semibold text-xl">

Selamat datang, {user.nama}

</h2>


<p className="text-sm text-gray-400">

{user.role}

</p>


</div>



<div className="flex gap-5 items-center">


<div>
🔔
</div>



<div className="
w-10
h-10
rounded-full
bg-slate-700
flex
items-center
justify-center
font-bold
">

{user.nama
?.charAt(0)
.toUpperCase()}


</div>


</div>


</header>

)

}