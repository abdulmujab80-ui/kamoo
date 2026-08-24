"use client";


export default function Logout(){


async function keluar(){


await fetch(
"/api/logout",
{
method:"POST"
}
);


window.location.href="/login";


}



return (

<button
onClick={keluar}
className="
text-red-500
"
>

Logout

</button>

)

}