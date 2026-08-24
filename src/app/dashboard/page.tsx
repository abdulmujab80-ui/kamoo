import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import DashboardSuperadmin from "./components/DashboardSuperadmin";
import DashboardSekretaris from "./components/DashboardSekretaris";
import DashboardBendahara from "./components/DashboardBendahara";
import DashboardUser from "./components/DashboardUser";




export default async function DashboardPage(){



const session =
await getSession();




if(!session){

redirect("/login");

}





switch(session.role){



case "SUPERADMIN":

return (

<DashboardSuperadmin

user={session}

/>

);






case "ADMIN_SEKRETARIS":

return (

<DashboardSekretaris

user={session}

/>

);






case "ADMIN_BENDAHARA":

return (

<DashboardBendahara

user={session}

/>

);






case "PENGURUS":

case "ANGGOTA":

return (

<DashboardUser

user={session}

/>

);






default:

return (

<DashboardUser

user={session}

/>

);



}


}