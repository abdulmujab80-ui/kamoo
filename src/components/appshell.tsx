"use client";

import {
  usePathname,
} from "next/navigation";

import {
  useState,
} from "react";

import Sidebar from "./sidebar";
import MobileMenu from "./mobilemenu";
import Topbar from "./topbar";

import type {
  AppRole,
} from "./navigation";


type AppShellProps = {
  children: React.ReactNode;

  user: {
    nama: string;
    role: AppRole;
  } | null;
};


export default function AppShell({
  children,
  user,
}: AppShellProps) {

  const pathname = usePathname();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);


  const publicRoute =
    pathname.startsWith("/login");


  if (
    publicRoute ||
    !user
  ) {
    return <>{children}</>;
  }


  return (
    <div
      className="
        min-h-screen
        bg-[#f7fbfc]
        text-slate-900
      "
    >

      <Sidebar
        role={user.role}
      />


      <MobileMenu
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
        role={user.role}
      />


      <div
        className="
          min-h-screen
          lg:ml-72
        "
      >

        <Topbar
          nama={user.nama}
          role={user.role}
          onMenuClick={() =>
            setMobileMenuOpen(true)
          }
        />


        <main
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-4
            py-5
            sm:px-5
            sm:py-6
            md:px-7
            lg:px-8
            lg:py-8
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
}