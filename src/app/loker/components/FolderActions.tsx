"use client";

import {
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  hapusFolder,
  renameFolder,
} from "../actions";


type Props = {
  folderId: string;
  nama: string;
};


type MenuPosition = {
  top: number;
  left: number;
};


export default function FolderActions({
  folderId,
  nama,
}: Props) {

  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    mode,
    setMode,
  ] = useState<
    "rename" | "delete" | null
  >(null);


  const [
    newName,
    setNewName,
  ] = useState(nama);


  const [
    error,
    setError,
  ] = useState("");


  const [
    isPending,
    startTransition,
  ] = useTransition();


  const buttonRef =
    useRef<HTMLButtonElement | null>(
      null
    );


  const [
    menuPosition,
    setMenuPosition,
  ] = useState<MenuPosition>({
    top: 0,
    left: 0,
  });


  function openMenu() {

    const button =
      buttonRef.current;

    if (!button) {
      return;
    }


    const rect =
      button.getBoundingClientRect();


    const menuWidth =
      192;


    const menuHeight =
      96;


    let left =
      rect.right -
      menuWidth;


    let top =
      rect.bottom + 8;


    const padding =
      12;


    if (
      left <
      padding
    ) {
      left =
        padding;
    }


    if (
      left + menuWidth >
      window.innerWidth - padding
    ) {
      left =
        window.innerWidth -
        menuWidth -
        padding;
    }


    if (
      top + menuHeight >
      window.innerHeight - padding
    ) {
      top =
        rect.top -
        menuHeight -
        8;
    }


    setMenuPosition({
      top,
      left,
    });


    setOpen(true);
  }


  function closeMenu() {

    if (isPending) {
      return;
    }

    setOpen(false);
  }


  function closeDialog() {

    if (isPending) {
      return;
    }

    setMode(null);
    setOpen(false);
    setError("");
  }


  useEffect(() => {

    if (!open) {
      return;
    }


    function handleResize() {

      const button =
        buttonRef.current;

      if (!button) {
        return;
      }


      const rect =
        button.getBoundingClientRect();


      const menuWidth =
        192;


      const menuHeight =
        96;


      const padding =
        12;


      let left =
        rect.right -
        menuWidth;


      let top =
        rect.bottom + 8;


      if (
        left < padding
      ) {
        left = padding;
      }


      if (
        left + menuWidth >
        window.innerWidth -
          padding
      ) {
        left =
          window.innerWidth -
          menuWidth -
          padding;
      }


      if (
        top + menuHeight >
        window.innerHeight -
          padding
      ) {
        top =
          rect.top -
          menuHeight -
          8;
      }


      setMenuPosition({
        top,
        left,
      });
    }


    window.addEventListener(
      "resize",
      handleResize
    );


    window.addEventListener(
      "scroll",
      handleResize,
      true
    );


    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "scroll",
        handleResize,
        true
      );

    };

  }, [open]);


  function submitRename(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");


    startTransition(
      async () => {

        try {

          await renameFolder(
            folderId,
            newName
          );

          setMode(null);
          setOpen(false);
          setError("");

          window.location.reload();

        } catch (err) {

          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengubah nama folder."
          );

        }

      }
    );
  }


  function submitDelete() {

    setError("");


    startTransition(
      async () => {

        try {

          await hapusFolder(
            folderId
          );

          setMode(null);
          setOpen(false);
          setError("");

          window.location.reload();

        } catch (err) {

          setError(
            err instanceof Error
              ? err.message
              : "Gagal menghapus folder."
          );

        }

      }
    );
  }


  return (
    <>
      {/* ==================================================
          ACTION BUTTON
      ================================================== */}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => {

          if (open) {
            closeMenu();
            return;
          }

          openMenu();
        }}
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          text-slate-400
          transition
          hover:bg-slate-100
          hover:text-slate-700
        "
        aria-label={
          `Aksi ${nama}`
        }
        aria-expanded={
          open
        }
      >

        <MoreVertical
          size={18}
        />

      </button>


      {/* ==================================================
          MENU
      ================================================== */}

      {open && mode === null && (
        <>

          <button
            type="button"
            aria-label="Tutup menu"
            onClick={closeMenu}
            className="
              fixed
              inset-0
              z-[80]
              cursor-default
            "
          />


          <div
            className="
              fixed
              z-[90]
              w-48
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-xl
            "
            style={{
              top:
                `${menuPosition.top}px`,
              left:
                `${menuPosition.left}px`,
            }}
          >

            <button
              type="button"
              onClick={() => {

                setNewName(nama);
                setError("");
                setMode("rename");

              }}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >

              <Pencil
                size={16}
              />

              Ubah Nama

            </button>


            <button
              type="button"
              onClick={() => {

                setError("");
                setMode("delete");

              }}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                text-sm
                font-medium
                text-rose-600
                transition
                hover:bg-rose-50
              "
            >

              <Trash2
                size={16}
              />

              Hapus Folder

            </button>

          </div>

        </>
      )}


      {/* ==================================================
          RENAME DIALOG
      ================================================== */}

      {mode === "rename" && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/40
            px-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-2xl
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
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
                  Ubah Nama Folder
                </h2>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Gunakan nama yang mudah
                  dikenali.
                </p>

              </div>


              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-50
                  hover:text-slate-700
                  disabled:opacity-40
                "
                aria-label="Tutup"
              >

                <X
                  size={18}
                />

              </button>

            </div>


            <form
              onSubmit={submitRename}
              className="mt-5"
            >

              <label
                htmlFor={`rename-${folderId}`}
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Nama Folder
              </label>


              <input
                id={`rename-${folderId}`}
                autoFocus
                value={newName}
                onChange={(event) =>
                  setNewName(
                    event.target.value
                  )
                }
                maxLength={100}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />


              {error && (
                <p
                  className="
                    mt-3
                    rounded-xl
                    bg-rose-50
                    px-3
                    py-2
                    text-xs
                    leading-5
                    text-rose-700
                  "
                >
                  {error}
                </p>
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
                  onClick={closeDialog}
                  disabled={isPending}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
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
                  type="submit"
                  disabled={
                    isPending ||
                    !newName.trim()
                  }
                  className="
                    rounded-xl
                    bg-cyan-600
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-cyan-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ==================================================
          DELETE DIALOG
      ================================================== */}

      {mode === "delete" && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/40
            px-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-2xl
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-rose-50
                text-rose-600
              "
            >

              <Trash2
                size={21}
              />

            </div>


            <h2
              className="
                mt-4
                text-base
                font-bold
                text-slate-900
              "
            >
              Hapus folder?
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              Folder{" "}
              <span
                className="
                  font-semibold
                  text-slate-700
                "
              >
                “{nama}”
              </span>{" "}
              akan dihapus. Pastikan folder
              tidak memiliki file penting.
            </p>


            {error && (
              <p
                className="
                  mt-4
                  rounded-xl
                  bg-rose-50
                  px-3
                  py-2
                  text-xs
                  leading-5
                  text-rose-700
                "
              >
                {error}
              </p>
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
                onClick={closeDialog}
                disabled={isPending}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
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
                onClick={submitDelete}
                disabled={isPending}
                className="
                  rounded-xl
                  bg-rose-600
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-rose-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isPending
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}