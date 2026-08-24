import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable:"--font-geist-sans",
  subsets:["latin"],
});


const geistMono = Geist_Mono({
  variable:"--font-geist-mono",
  subsets:["latin"],
});



export const metadata: Metadata = {

title:"KAMOO | Manajemen Operasional Organisasi",

description:
"Sistem administrasi organisasi KATI",

};



export default function RootLayout({

children,

}: Readonly<{

children:React.ReactNode

}>) {


return (

<html

lang="id"

className={`
${geistSans.variable}
${geistMono.variable}
antialiased
h-full
`}

>


<body

className="
bg-[#050b14]
text-white
min-h-screen
"

>


{children}


</body>


</html>

)

}