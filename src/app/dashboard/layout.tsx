import Sidebar from "@/components/sidebar";
import MobileMenu from "@/components/mobilemenu";
import Topbar from "@/components/topbar";



export default function DashboardLayout({

children

}:{

children:React.ReactNode;

}){


return (

<div

className="
min-h-screen
bg-[#050b14]
text-white
"

>



{/* DESKTOP SIDEBAR */}

<Sidebar/>





{/* MOBILE DRAWER */}

<MobileMenu/>







{/* MAIN AREA */}

<div

className="
lg:ml-72
min-h-screen
"

>



{/* TOPBAR */}

<Topbar/>







{/* CONTENT */}

<main

className="
p-4
md:p-6
lg:p-8
"

>

{children}

</main>





</div>





</div>


)

}