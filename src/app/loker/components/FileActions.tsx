"use client";

import {
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  hapusFile,
  renameFile,
} from "../actions";


type Props = {
  fileId: string;
  nama: string;
  compact?: boolean;
};


export default function FileActions({
  fileId,
  nama,
  compact = false,
}: Props) {
  const router =
    useRouter();


  const [
    openRename,
    setOpenRename,
  ] = useState(false);


  const [
    openDelete,
    setOpenDelete,
  ] = useState(false);


  const [
    newName,
    setNewName,
  ] = useState(
    nama
  );


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ====================================================
  // RENAME
  // ====================================================

  async function handleRename(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const cleanName =
      newName.trim();


    if (!cleanName) {
      setError(
        "Nama file wajib diisi."
      );

      return;
    }


    setSubmitting(true);

    setError("");


    try {
      await renameFile(
        fileId,
        cleanName
      );


      setOpenRename(
        false
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah nama file."
      );

    } finally {
      setSubmitting(
        false
      );
    }
  }


  // ====================================================
  // DELETE
  // ====================================================

  async function handleDelete() {
    setSubmitting(true);

    setError("");


    try {
      await hapusFile(
        fileId
      );


      setOpenDelete(
        false
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus file."
      );

    } finally {
      setSubmitting(
        false
      );
    }
  }


  return (
    <>

      {/* ==================================================
          ACTION BUTTONS
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-1
        "
      >
        <button
          type="button"
          onClick={() => {
            setNewName(
              nama
            );

            setError("");

            setOpenRename(
              true
            );
          }}
          aria-label={
            `Ubah nama ${nama}`
          }
          title="Ubah nama"
          className={`
            inline-flex
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            font-semibold
            text-slate-500
            transition
            hover:border-cyan-200
            hover:bg-cyan-50
            hover:text-cyan-700
            ${
              compact
                ? "h-9 w-9"
                : "h-9 w-9"
            }
          `}
        >
          <Pencil
            size={15}
          />
        </button>


        <button
          type="button"
          onClick={() => {
            setError("");

            setOpenDelete(
              true
            );
          }}
          aria-label={
            `Hapus ${nama}`
          }
          title="Hapus file"
          className={`
            inline-flex
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            font-semibold
            text-slate-500
            transition
            hover:border-rose-200
            hover:bg-rose-50
            hover:text-rose-600
            ${
              compact
                ? "h-9 w-9"
                : "h-9 w-9"
            }
          `}
        >
          <Trash2
            size={15}
          />
        </button>
      </div>


      {/* ==================================================
          RENAME MODAL
      ================================================== */}

      {openRename && (
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
            if (!submitting) {
              setOpenRename(
                false
              );
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
                  Ubah Nama File
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Nama file akan disinkronkan
                  ke Google Drive KAMOO.
                </p>
              </div>


              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={() => {
                  setOpenRename(
                    false
                  );
                }}
                aria-label="Tutup"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-50
                  hover:text-slate-700
                  disabled:opacity-40
                "
              >
                <X
                  size={18}
                />
              </button>
            </div>


            <form
              onSubmit={
                handleRename
              }
              className="p-5"
            >
              <label
                htmlFor={
                  `rename-${fileId}`
                }
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Nama File
              </label>


              <input
                id={
                  `rename-${fileId}`
                }
                value={
                  newName
                }
                onChange={(event) => {
                  setNewName(
                    event.target.value
                  );
                }}
                autoFocus
                maxLength={255}
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
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />


              {error && (
                <div
                  className="
                    mt-3
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
                    submitting
                  }
                  onClick={() => {
                    setOpenRename(
                      false
                    );
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
                  type="submit"
                  disabled={
                    submitting ||
                    !newName.trim()
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-cyan-600
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-cyan-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {submitting && (
                    <Loader2
                      size={16}
                      className="
                        animate-spin
                      "
                    />
                  )}

                  {submitting
                    ? "Menyimpan..."
                    : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ==================================================
          DELETE MODAL
      ================================================== */}

      {openDelete && (
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
            if (!submitting) {
              setOpenDelete(
                false
              );
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
                  Hapus File
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  File akan dihapus dari
                  KAMOO dan Google Drive.
                </p>
              </div>


              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={() => {
                  setOpenDelete(
                    false
                  );
                }}
                aria-label="Tutup"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-50
                  hover:text-slate-700
                  disabled:opacity-40
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
                  File yang akan dihapus
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
                  {nama}
                </p>
              </div>


              {error && (
                <div
                  className="
                    mt-3
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
                    submitting
                  }
                  onClick={() => {
                    setOpenDelete(
                      false
                    );
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
                    submitting
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
                  {submitting ? (
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

                  {submitting
                    ? "Menghapus..."
                    : "Hapus File"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
