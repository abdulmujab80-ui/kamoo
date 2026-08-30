"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChevronRight,
  Sparkles,
} from "lucide-react";

import Logout from "./logout";

import {
  navigationGroups,
  canSeeNavigation,
  isNavigationActive,
  type AppRole,
} from "./navigation";


type SidebarProps = {
  role: AppRole;
};


export default function Sidebar({
  role,
}: SidebarProps) {

  const pathname = usePathname();


  return (
    <aside
      className="
        hidden
        lg:flex
        fixed
        left-0
        top-0
        z-50
        h-screen
        w-72
        flex-col
        border-r
        border-slate-200
        bg-white/95
        backdrop-blur-xl
      "
    >

      {/* BRAND */}

      <div
        className="
          shrink-0
          border-b
          border-slate-100
          px-6
          py-7
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-teal-600
              to-cyan-500
              text-white
              shadow-lg
              shadow-cyan-100
            "
          >
            <Sparkles size={21} />
          </div>

          <div>

            <h1
              className="
                bg-gradient-to-r
                from-teal-700
                to-cyan-600
                bg-clip-text
                text-2xl
                font-extrabold
                tracking-tight
                text-transparent
              "
            >
              KAMOO
            </h1>

            <p className="text-[11px] text-slate-500">
              Operasional Organisasi
            </p>

          </div>

        </div>

      </div>


      {/* NAVIGATION */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-4
          py-5
        "
      >

        <div className="space-y-6">

          {navigationGroups.map((group) => {

            const visibleItems =
              group.items.filter((item) =>
                canSeeNavigation(
                  item.roles,
                  role
                )
              );


            if (visibleItems.length === 0) {
              return null;
            }


            return (
              <div key={group.label}>

                <p
                  className="
                    mb-2
                    px-3
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-slate-400
                  "
                >
                  {group.label}
                </p>


                <div className="space-y-1">

                  {visibleItems.map((item) => {

                    const Icon = item.icon;

                    const active =
                      isNavigationActive(
                        pathname,
                        item.href,
                        item.exact
                      );


                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          group
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          px-3.5
                          py-3
                          text-sm
                          font-medium
                          transition-all
                          duration-200

                          ${
                            active
                              ? `
                                bg-gradient-to-r
                                from-cyan-50
                                to-teal-50
                                text-teal-700
                                shadow-sm
                                ring-1
                                ring-cyan-100
                              `
                              : `
                                text-slate-600
                                hover:bg-slate-50
                                hover:text-slate-900
                              `
                          }
                        `}
                      >

                        <div className="flex items-center gap-3">

                          <Icon
                            size={18}
                            strokeWidth={1.9}
                            className={
                              active
                                ? "text-cyan-600"
                                : "text-slate-400 group-hover:text-cyan-600"
                            }
                          />

                          <span>
                            {item.title}
                          </span>

                        </div>


                        {active && (
                          <ChevronRight
                            size={15}
                            className="text-cyan-500"
                          />
                        )}

                      </Link>
                    );

                  })}

                </div>

              </div>
            );

          })}

        </div>

      </nav>


      {/* FOOTER */}

      <div
        className="
          shrink-0
          border-t
          border-slate-100
          p-4
        "
      >
        <Logout />
      </div>

    </aside>
  );
}