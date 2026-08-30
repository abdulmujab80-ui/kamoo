import type {
  Metadata,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import AppShell from "@/components/appshell";

import {
  getSession,
} from "@/lib/auth";

import type {
  AppRole,
} from "@/components/navigation";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "KAMOO",
    template: "%s | KAMOO",
  },

  description:
    "KATI Manajemen Operasional Organisasi",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session =
    await getSession();


  const user =
    session
      ? {
          nama:
            String(
              session.nama ??
              "Pengguna"
            ),

          role:
            String(
              session.role ??
              "ANGGOTA"
            ) as AppRole,
        }
      : null;


  return (
    <html
      lang="id"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        antialiased
      `}
    >

      <body
        className="
          min-h-screen
          bg-[#f7fbfc]
          text-slate-900
        "
      >

        <AppShell user={user}>
          {children}
        </AppShell>

      </body>

    </html>
  );
}