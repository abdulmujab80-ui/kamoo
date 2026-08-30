"use client";

import {
  LogOut,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";


export default function Logout() {

  const router = useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function keluar() {

    if (loading) {
      return;
    }


    setLoading(true);


    try {

      const response =
        await fetch(
          "/api/logout",
          {
            method: "POST",
          }
        );


      if (!response.ok) {
        throw new Error(
          "Logout gagal"
        );
      }


      router.replace("/login");

      router.refresh();

    } catch {

      setLoading(false);

    }

  }


  return (
    <button
      type="button"
      disabled={loading}
      onClick={keluar}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3.5
        py-3
        text-sm
        font-medium
        text-slate-500
        transition
        hover:bg-red-50
        hover:text-red-600
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >

      <LogOut size={18} />

      <span>
        {loading
          ? "Keluar..."
          : "Keluar"}
      </span>

    </button>
  );
}