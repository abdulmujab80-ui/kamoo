import { ReactNode } from "react";


export default function CardStat({

title,

value,

icon,

description,

color="cyan"

}:{

title:string;

value:string | number;

icon:ReactNode;

description?:string;

color?:
"cyan"
|
"green"
|
"orange"
|
"purple";

}){



const colors = {


cyan:
"from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",


green:
"from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",


orange:
"from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400",


purple:
"from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400",


};



return (

<div

className={`
relative
overflow-hidden
rounded-2xl
border
bg-gradient-to-br
${colors[color]}
bg-[#0b1628]
p-6
transition-all
duration-300
hover:-translate-y-1
hover:shadow-xl
group
`}

>


{/* ICON */}

<div

className="
mb-5
flex
h-12
w-12
items-center
justify-center
rounded-xl
bg-white/5
transition
duration-300
group-hover:scale-110
"

>

<div

className="
text-current
"

>

{icon}

</div>


</div>







{/* TITLE */}

<p

className="
text-sm
text-slate-400
"

>

{title}

</p>






{/* VALUE */}

<h2

className="
mt-2
text-4xl
font-bold
tracking-tight
text-white
"

>

{value}

</h2>








{
description &&

<p

className="
mt-3
text-xs
text-slate-500
"

>

{description}

</p>

}



</div>


)

}