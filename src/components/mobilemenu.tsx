"use client";

import Link from "next/link";

import {
  X,
  Sparkles,
} from "lucide-react";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import Logout from "./logout";

import {
  navigationGroups,
  canSeeNavigation,
  isNavigationActive,
  type AppRole,
} from "./navigation";


type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  role: AppRole;
};


export default function MobileMenu({
  open,
  onClose,
  role,
}: MobileMenuProps) {

  const pathname = usePathname();


  useEffect(() => {

    if (!open) {
      return;
    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow = "hidden";


    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [open, onClose]);


  if (!open) {
    return null;
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        lg:hidden
      "
    >

      {/* OVERLAY */}

      <button
        type="button"
        aria-label="Tutup menu"
        onClick={onClose}
        className="
          absolute
          inset-0
          h-full
          w-full
          bg-slate-900/25
          backdrop-blur-sm
        "
      />


      {/* DRAWER */}

      <aside
        className="
          absolute
          left-0
          top-0
          flex
          h-full
          w-[86%]
          max-w-[320px]
          flex-col
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-5
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-teal-600
                to-cyan-500
                text-white
              "
            >
              <Sparkles size={19} />
            </div>

            <div>

              <h2
                className="
                  text-lg
                  font-extrabold
                  text-slate-900
                "
              >
                KAMOO
              </h2>

              <p className="text-[10px] text-slate-500">
                Operasional Organisasi
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
            "
          >
            <X size={20} />
          </button>

        </div>


        {/* MENU */}

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
                          onClick={onClose}
                          className={`
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3.5
                            py-3
                            text-sm
                            font-medium
                            transition-all

                            ${
                              active
                                ? `
                                  bg-cyan-50
                                  text-teal-700
                                `
                                : `
                                  text-slate-600
                                  hover:bg-slate-50
                                `
                            }
                          `}
                        >

                          <Icon
                            size={18}
                            className={
                              active
                                ? "text-cyan-600"
                                : "text-slate-400"
                            }
                          />

                          {item.title}

                        </Link>
                      );

                    })}

                  </div>

                </div>
              );

            })}

          </div>

        </nav>


        <div
          className="
            border-t
            border-slate-100
            p-4
          "
        >
          <Logout />
        </div>

      </aside>

    </div>
  );
}