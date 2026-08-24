import { login } from "./action";



export default function LoginPage(){


return (

<div

className="
min-h-screen
flex
items-center
justify-center
bg-gradient-to-br
from-[#eef7ff]
via-white
to-[#dff7f5]
px-5
"

>


<div

className="
w-full
max-w-5xl
grid
md:grid-cols-2
rounded-3xl
overflow-hidden
bg-white
shadow-2xl
border
border-slate-200
"

>






{/* LEFT BRAND */}


<div

className="
hidden
md:flex
flex-col
justify-between
bg-gradient-to-br
from-[#0f766e]
to-[#0891b2]
p-10
text-white
"

>


<div>


<h1

className="
text-4xl
font-bold
tracking-wide
"

>

KAMOO

</h1>



<p

className="
mt-3
text-white/80
leading-relaxed
"

>

KATI Manajemen Operasional Organisasi

</p>


</div>







<div>


<div

className="
rounded-2xl
bg-white/10
p-6
backdrop-blur
"

>


<p

className="
text-lg
font-medium
"

>

"Organisasi yang tertata,
membangun pelayanan yang lebih baik."

</p>



</div>


</div>



</div>









{/* FORM */}



<div

className="
p-8
md:p-12
"

>


<h2

className="
text-3xl
font-bold
text-slate-800
"

>

Selamat Datang

</h2>



<p

className="
mt-2
text-slate-500
"

>

Masuk ke sistem operasional organisasi

</p>








<form

action={login}

className="
mt-8
space-y-5
"

>



<div>


<label

className="
text-sm
font-medium
text-slate-700
"

>

Email

</label>


<input

name="email"

type="email"

required

placeholder="nama@email.com"

className="
mt-2
w-full
rounded-xl
border
border-slate-200
bg-slate-50
px-4
py-3
text-slate-800
outline-none
transition
focus:border-cyan-500
focus:ring-4
focus:ring-cyan-100
"

/>


</div>







<div>


<label

className="
text-sm
font-medium
text-slate-700
"

>

Password

</label>



<input

name="password"

type="password"

required

placeholder="Masukkan password"

className="
mt-2
w-full
rounded-xl
border
border-slate-200
bg-slate-50
px-4
py-3
text-slate-800
outline-none
transition
focus:border-cyan-500
focus:ring-4
focus:ring-cyan-100
"

/>


</div>







<button

className="
w-full
rounded-xl
bg-gradient-to-r
from-cyan-600
to-teal-500
py-3.5
font-semibold
text-white
shadow-lg
shadow-cyan-200
transition
hover:scale-[1.02]
hover:shadow-xl
"

>

Masuk

</button>






<p

className="
text-center
text-xs
text-slate-400
pt-3
"

>

Pengurus • Admin • Superadmin

</p>




</form>






</div>







</div>





</div>


)

}