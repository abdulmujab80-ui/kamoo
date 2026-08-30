"use client";

import {
  Camera,
  ImagePlus,
  Loader2,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";


type Props = {
  nama: string;
  initialUrl:
    string | null;
};


type ApiResponse = {
  success?:
    boolean;

  fotoProfil?:
    string | null;

  error?:
    string;
};


const MAX_FILE_SIZE =
  2 * 1024 * 1024;


const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


// ======================================================
// AVATAR UPLOADER
// ======================================================

export default function AvatarUploader({
  nama,
  initialUrl,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(
      null
    );


  const [
    avatarUrl,
    setAvatarUrl,
  ] = useState<
    string | null
  >(
    initialUrl
  );


  const [
    selectedFile,
    setSelectedFile,
  ] = useState<
    File | null
  >(
    null
  );


  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<
    string | null
  >(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // ====================================================
  // PREVIEW CLEANUP
  // ====================================================

  useEffect(
    () => {
      return () => {
        if (
          previewUrl
        ) {
          URL.revokeObjectURL(
            previewUrl
          );
        }
      };
    },
    [
      previewUrl,
    ]
  );


  // ====================================================
  // FILE SELECT
  // ====================================================

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setSuccess("");


    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      event.target.value =
        "";

      setError(
        "Format foto harus JPG, PNG, atau WEBP."
      );

      return;
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      event.target.value =
        "";

      setError(
        "Ukuran foto maksimal 2 MB."
      );

      return;
    }


    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }


    const objectUrl =
      URL.createObjectURL(
        file
      );


    setSelectedFile(
      file
    );


    setPreviewUrl(
      objectUrl
    );
  }


  // ====================================================
  // RESET SELECT
  // ====================================================

  function resetSelection() {
    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }


    setPreviewUrl(
      null
    );


    setSelectedFile(
      null
    );


    if (
      inputRef.current
    ) {
      inputRef.current.value =
        "";
    }
  }


  // ====================================================
  // UPLOAD
  // ====================================================

  async function handleUpload() {
    if (
      !selectedFile
    ) {
      setError(
        "Pilih foto terlebih dahulu."
      );

      return;
    }


    setLoading(true);
    setError("");
    setSuccess("");


    try {
      const formData =
        new FormData();


      formData.set(
        "file",
        selectedFile
      );


      const response =
        await fetch(
          "/api/profile/avatar",
          {
            method:
              "POST",

            body:
              formData,
          }
        );


      const result =
        await response.json() as ApiResponse;


      if (
        !response.ok
      ) {
        throw new Error(
          result.error ??
            "Upload foto profil gagal."
        );
      }


      const nextUrl =
        result.fotoProfil ??
        null;


      setAvatarUrl(
        nextUrl
      );


      resetSelection();


      setSuccess(
        "Foto profil berhasil diperbarui."
      );


      window.dispatchEvent(
        new CustomEvent(
          "kamoo:avatar-updated",
          {
            detail: {
              fotoProfil:
                nextUrl,
            },
          }
        )
      );

    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload foto profil gagal."
      );

    } finally {
      setLoading(false);
    }
  }


  // ====================================================
  // DELETE
  // ====================================================

  async function handleDelete() {
    if (
      !avatarUrl
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        "Hapus foto profil dan kembali menggunakan avatar default?"
      );


    if (
      !confirmed
    ) {
      return;
    }


    setLoading(true);
    setError("");
    setSuccess("");


    try {
      const response =
        await fetch(
          "/api/profile/avatar",
          {
            method:
              "DELETE",
          }
        );


      const result =
        await response.json() as ApiResponse;


      if (
        !response.ok
      ) {
        throw new Error(
          result.error ??
            "Foto profil gagal dihapus."
        );
      }


      setAvatarUrl(
        null
      );


      resetSelection();


      setSuccess(
        "Foto profil berhasil dihapus."
      );


      window.dispatchEvent(
        new CustomEvent(
          "kamoo:avatar-updated",
          {
            detail: {
              fotoProfil:
                null,
            },
          }
        )
      );

    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Foto profil gagal dihapus."
      );

    } finally {
      setLoading(false);
    }
  }


  const displayedAvatar =
    previewUrl ??
    avatarUrl;


  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-5
          sm:flex-row
          sm:items-start
        "
      >
        {/* AVATAR */}

        <div
          className="
            relative
            h-28
            w-28
            shrink-0
            overflow-hidden
            rounded-3xl
            bg-gradient-to-br
            from-teal-600
            to-cyan-500
            shadow-lg
            shadow-cyan-100
          "
        >
          {displayedAvatar ? (
            <img
              src={
                displayedAvatar
              }
              alt={
                `Foto profil ${nama}`
              }
              className="
                h-full
                w-full
                object-cover
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                text-white
              "
            >
              <UserRound
                size={40}
              />
            </div>
          )}


          <div
            className="
              pointer-events-none
              absolute
              bottom-2
              right-2
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              bg-white/90
              text-cyan-700
              shadow-sm
              backdrop-blur
            "
          >
            <Camera
              size={15}
            />
          </div>
        </div>


        {/* CONTROLS */}

        <div
          className="
            min-w-0
            flex-1
            text-center
            sm:text-left
          "
        >
          <h2
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            Foto Profil
          </h2>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-slate-500
            "
          >
            Gunakan foto JPG, PNG,
            atau WEBP. Ukuran maksimal
            2 MB.
          </p>


          <input
            ref={
              inputRef
            }
            type="file"
            accept="
              image/jpeg,
              image/png,
              image/webp
            "
            onChange={
              handleFileChange
            }
            className="hidden"
          />


          <div
            className="
              mt-4
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:flex-wrap
            "
          >
            <button
              type="button"
              disabled={
                loading
              }
              onClick={() => {
                inputRef
                  .current
                  ?.click();
              }}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
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
                hover:border-cyan-200
                hover:bg-cyan-50
                hover:text-cyan-700
                disabled:opacity-50
              "
            >
              <ImagePlus
                size={17}
              />

              {avatarUrl
                ? "Pilih Foto Baru"
                : "Pilih Foto"}
            </button>


            {selectedFile && (
              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  handleUpload
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-cyan-600
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-cyan-700
                  disabled:opacity-50
                "
              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <Camera
                    size={17}
                  />
                )}

                Simpan Foto
              </button>
            )}


            {avatarUrl &&
            !selectedFile && (
              <button
                type="button"
                disabled={
                  loading
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
                  border
                  border-rose-200
                  bg-rose-50
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-rose-600
                  transition
                  hover:bg-rose-100
                  disabled:opacity-50
                "
              >
                <Trash2
                  size={17}
                />

                Hapus Foto
              </button>
            )}
          </div>


          {selectedFile && (
            <p
              className="
                mt-3
                text-xs
                text-slate-400
              "
            >
              Dipilih:{" "}
              <span
                className="
                  font-semibold
                  text-slate-600
                "
              >
                {
                  selectedFile.name
                }
              </span>
            </p>
          )}


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
                text-sm
                text-rose-700
              "
            >
              {error}
            </div>
          )}


          {success && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-3
                text-sm
                text-emerald-700
              "
            >
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
