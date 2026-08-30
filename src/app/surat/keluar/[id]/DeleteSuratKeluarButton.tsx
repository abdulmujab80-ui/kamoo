"use client";

import {
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  useState,
  useTransition,
} from "react";


type Props = {
  id: string;
  nomorSurat: string;

  action: (
    formData: FormData
  ) => Promise<void>;
};


export default function DeleteSuratKeluarButton({
  id,
  nomorSurat,
  action,
}: Props) {
  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    isPending,
    startTransition,
  ] = useTransition();


  const [
    error,
    setError,
  ] = useState("");


  function handleDelete() {
    setError("");


    const formData =
      new FormData();


    formData.set(
      "id",
      id
    );


    startTransition(
      async () => {
        try {
          await action(
            formData
          );

        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal menghapus surat keluar."
          );
        }
      }
    );
  }


  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-rose-600
          px-5
          py-3
          text-sm
          font-bold
          text-white
          transition
          hover:bg-rose-700
        "
      >
        <Trash2
          size={16}
        />

        Hapus
      </button>


      {open && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-slate-950/40
            px-4
            py-6
            backdrop-blur-sm
          "
          onMouseDown={() => {
            if (!isPending) {
              setOpen(false);
            }
          }}
        >
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-2xl
            "
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                border-b
                border-slate-100
                px-5
                py-5
              "
            >
              <div>
                <h2
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  "
                >
                  Hapus Surat Keluar
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Aksi ini hanya tersedia saat
                  surat masih DIPROSES.
                </p>
              </div>


              <button
                type="button"
                disabled={
                  isPending
                }
                onClick={() => {
                  setOpen(false);
                }}
                aria-label="Tutup"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-slate-400
                  transition
                  hover:bg-slate-50
                  hover:text-slate-700
                  disabled:opacity-50
                "
              >
                <X
                  size={18}
                />
              </button>
            </div>


            <div className="p-5">
              <div
                className="
                  rounded-2xl
                  border
                  border-rose-100
                  bg-rose-50
                  p-4
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold
                    text-rose-600
                  "
                >
                  Surat yang akan dihapus
                </p>

                <p
                  className="
                    mt-1
                    break-all
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {nomorSurat}
                </p>
              </div>


              <p
                className="
                  mt-4
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Nomor yang pernah dialokasikan
                tidak akan digunakan ulang agar
                jejak administrasi tetap konsisten.
              </p>


              {error && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-rose-200
                    bg-rose-50
                    px-4
                    py-3
                    text-xs
                    leading-5
                    text-rose-700
                  "
                >
                  {error}
                </div>
              )}


              <div
                className="
                  mt-5
                  flex
                  flex-col-reverse
                  gap-2
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  disabled={
                    isPending
                  }
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Batal
                </button>


                <button
                  type="button"
                  disabled={
                    isPending
                  }
                  onClick={
                    handleDelete
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-rose-600
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-rose-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isPending ? (
                    <Loader2
                      size={16}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <Trash2
                      size={16}
                    />
                  )}

                  {isPending
                    ? "Menghapus..."
                    : "Ya, Hapus Surat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
