"use client";

import { useRouter } from "next/navigation";

import {
  FileUp,
  FolderPlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  FormEvent,
  useId,
  useState,
} from "react";

import {
  buatFolder,
} from "../actions";


// ======================================================
// TYPES
// ======================================================

type Props = {
  lokerId: string;
  parentId?: string | null;
};


type UploadResponse = {
  success?: boolean;

  file?: {
    id?: string;
    name?: string;
    mimeType?: string;
    size?: number | string;
    webViewLink?: string;
    webContentLink?: string;
  };

  error?: string;
};


// ======================================================
// FORMAT SIZE
// ======================================================

function formatSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  if (
    bytes <
    1024 * 1024 * 1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(2)} GB`;
}


// ======================================================
// COMPONENT
// ======================================================

export default function LokerActions({
  lokerId,
  parentId = null,
}: Props) {

  const router =
    useRouter();


  const fileInputId =
    useId();


  // ====================================================
  // FOLDER
  // ====================================================

  const [
    openFolder,
    setOpenFolder,
  ] = useState(false);


  const [
    nama,
    setNama,
  ] = useState("");


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    folderError,
    setFolderError,
  ] = useState("");


  // ====================================================
  // UPLOAD
  // ====================================================

  const [
    openUpload,
    setOpenUpload,
  ] = useState(false);


  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null
  );


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const [
    uploadError,
    setUploadError,
  ] = useState("");


  const [
    uploadSuccess,
    setUploadSuccess,
  ] = useState("");


  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);


  // ====================================================
  // CREATE FOLDER
  // ====================================================

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const cleanName =
      nama.trim();


    if (!cleanName) {

      setFolderError(
        "Nama folder wajib diisi."
      );

      return;
    }


    setFolderError("");

    setSubmitting(true);


    try {

      await buatFolder(
        lokerId,
        cleanName,
        parentId
      );


      setNama("");

      setOpenFolder(false);


      // Tetap di halaman aktif.
      // Aman dipakai di Loker sendiri maupun Loker shared.
      router.refresh();


    } catch (err) {

      setFolderError(
        err instanceof Error
          ? err.message
          : "Gagal membuat folder."
      );


    } finally {

      setSubmitting(false);

    }
  }


  // ====================================================
  // RESET UPLOAD
  // ====================================================

  function resetUpload() {

    if (uploading) {
      return;
    }


    setSelectedFile(null);

    setUploadError("");

    setUploadSuccess("");

    setUploadProgress(0);
  }


  // ====================================================
  // CLOSE UPLOAD
  // ====================================================

  function closeUpload() {

    if (uploading) {
      return;
    }


    resetUpload();

    setOpenUpload(false);
  }


  // ====================================================
  // FILE SELECT
  // ====================================================

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0] ??
      null;


    setUploadError("");

    setUploadSuccess("");

    setUploadProgress(0);


    if (!file) {

      setSelectedFile(null);

      return;
    }


    const maxFileSize =
      100 * 1024 * 1024;


    if (
      file.size >
      maxFileSize
    ) {

      setSelectedFile(null);


      setUploadError(
        "Ukuran file maksimal 100 MB."
      );


      event.target.value =
        "";


      return;
    }


    setSelectedFile(
      file
    );
  }


  // ====================================================
  // UPLOAD
  // Browser -> KAMOO API -> Google Drive
  // ====================================================

  async function handleUpload() {

    if (!selectedFile) {

      setUploadError(
        "Pilih file terlebih dahulu."
      );

      return;
    }


    setUploading(true);

    setUploadError("");

    setUploadSuccess("");

    setUploadProgress(15);


    try {

      // =================================================
      // SEND FILE TO KAMOO API
      // =================================================

      const response =
        await fetch(
          "/api/loker/upload",
          {
            method: "POST",

            headers: {

              "Content-Type":
                selectedFile.type ||
                "application/octet-stream",

              "X-KAMOO-LOKER-ID":
                lokerId,

              "X-KAMOO-FOLDER-ID":
                parentId ??
                "ROOT",

              "X-KAMOO-FILE-NAME":
                encodeURIComponent(
                  selectedFile.name
                ),

              "X-KAMOO-FILE-SIZE":
                String(
                  selectedFile.size
                ),
            },

            body:
              selectedFile,
          }
        );


      setUploadProgress(
        75
      );


      let result:
        UploadResponse;


      try {

        result =
          (await response.json()) as UploadResponse;

      } catch {

        throw new Error(
          "Server KAMOO memberikan response yang tidak valid."
        );

      }


      if (!response.ok) {

        throw new Error(
          result.error ??
            `Upload gagal (${response.status}).`
        );

      }


      if (
        !result.success ||
        !result.file?.id
      ) {

        throw new Error(
          "Google Drive tidak mengembalikan File ID."
        );

      }


      // =================================================
      // SUCCESS
      // =================================================

      setUploadProgress(
        100
      );


      setUploadSuccess(
        `"${result.file.name ?? selectedFile.name}" berhasil disimpan ke Loker.`
      );


      // Refresh Server Component agar metadata file
      // yang baru tersimpan langsung tampil di Loker.
      router.refresh();


      // Tampilkan status sukses sebentar,
      // lalu tutup modal dan bersihkan state upload.
      window.setTimeout(
        () => {
          setOpenUpload(false);

          setSelectedFile(
            null
          );

          setUploadError(
            ""
          );

          setUploadSuccess(
            ""
          );

          setUploadProgress(
            0
          );

          router.refresh();
        },
        900
      );


    } catch (err) {

      console.error(
        "Upload Loker gagal:",
        err
      );


      setUploadProgress(
        0
      );


      setUploadError(
        err instanceof Error
          ? err.message
          : "Upload file gagal."
      );


    } finally {

      setUploading(
        false
      );

    }
  }


  // ====================================================
  // UI
  // ====================================================

  return (
    <>

      {/* ==================================================
          MAIN BUTTONS
      ================================================== */}

      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
        "
      >

        <button
          type="button"
          onClick={() => {

            setFolderError("");

            setOpenFolder(
              true
            );

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
            py-3
            text-sm
            font-bold
            text-slate-700
            shadow-sm
            transition
            hover:border-cyan-200
            hover:bg-cyan-50
            hover:text-cyan-700
          "
        >

          <FolderPlus
            size={17}
          />

          Buat Folder

        </button>


        <button
          type="button"
          onClick={() => {

            resetUpload();

            setOpenUpload(
              true
            );

          }}
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
            shadow-sm
            transition
            hover:bg-cyan-700
          "
        >

          <Upload
            size={17}
          />

          Upload File

        </button>

      </div>


      {/* ==================================================
          FOLDER MODAL
      ================================================== */}

      {openFolder && (

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

              setOpenFolder(
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

            {/* HEADER */}

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

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-amber-50
                    text-amber-500
                  "
                >

                  <FolderPlus
                    size={20}
                  />

                </div>


                <div>

                  <h2
                    className="
                      text-base
                      font-bold
                      text-slate-900
                    "
                  >
                    Buat Folder
                  </h2>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Buat ruang baru untuk
                    mengelompokkan berkas Anda.
                  </p>

                </div>

              </div>


              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={() =>
                  setOpenFolder(
                    false
                  )
                }
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
                aria-label="Tutup"
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleCreate
              }
              className="p-5"
            >

              <label
                htmlFor="nama-folder"
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
                id="nama-folder"
                value={
                  nama
                }
                onChange={(event) =>
                  setNama(
                    event.target.value
                  )
                }
                autoFocus
                maxLength={100}
                placeholder="Contoh: Proposal Kegiatan"
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
                  placeholder:text-slate-400
                  focus:border-cyan-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-50
                "
              />


              {folderError && (

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
                  {folderError}
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
                  onClick={() =>
                    setOpenFolder(
                      false
                    )
                  }
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
                    !nama.trim()
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
                    ? "Membuat..."
                    : "Buat Folder"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ==================================================
          UPLOAD MODAL
      ================================================== */}

      {openUpload && (

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

            if (!uploading) {
              closeUpload();
            }

          }}
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
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

            {/* HEADER */}

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
                sm:px-6
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-50
                    text-cyan-600
                  "
                >

                  <FileUp
                    size={20}
                  />

                </div>


                <div>

                  <h2
                    className="
                      text-base
                      font-bold
                      text-slate-900
                    "
                  >
                    Upload File
                  </h2>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    File akan disimpan
                    ke Loker KAMOO.
                  </p>

                </div>

              </div>


              <button
                type="button"
                disabled={
                  uploading
                }
                onClick={
                  closeUpload
                }
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


            {/* BODY */}

            <div
              className="
                p-5
                sm:p-6
              "
            >

              <input
                id={
                  fileInputId
                }
                type="file"
                disabled={
                  uploading
                }
                onChange={
                  handleFileChange
                }
                className="
                  sr-only
                "
              />


              <label
                htmlFor={
                  fileInputId
                }
                className={`
                  flex
                  min-h-44
                  w-full
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border-2
                  border-dashed
                  border-slate-200
                  bg-slate-50
                  px-5
                  py-6
                  text-center
                  transition
                  ${
                    uploading
                      ? "pointer-events-none opacity-60"
                      : "cursor-pointer hover:border-cyan-300 hover:bg-cyan-50/50"
                  }
                `}
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-cyan-50
                    text-cyan-600
                  "
                >

                  <FileUp
                    size={22}
                  />

                </div>


                {selectedFile ? (
                  <>

                    <p
                      className="
                        mt-4
                        max-w-full
                        break-all
                        text-sm
                        font-bold
                        text-slate-800
                      "
                    >
                      {selectedFile.name}
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      {formatSize(
                        selectedFile.size
                      )}
                    </p>


                    {!uploading &&
                      !uploadSuccess && (

                        <p
                          className="
                            mt-3
                            text-xs
                            font-semibold
                            text-cyan-600
                          "
                        >
                          Klik untuk mengganti file
                        </p>

                      )}

                  </>
                ) : (
                  <>

                    <p
                      className="
                        mt-4
                        text-sm
                        font-bold
                        text-slate-800
                      "
                    >
                      Pilih file dari perangkat
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-slate-500
                      "
                    >
                      Klik area ini untuk
                      membuka file explorer.
                    </p>


                    <p
                      className="
                        mt-2
                        text-[11px]
                        font-medium
                        text-slate-400
                      "
                    >
                      Maksimal 100 MB
                    </p>

                  </>
                )}

              </label>


              {/* PROGRESS */}

              {uploadProgress > 0 && (

                <div
                  className="
                    mt-5
                  "
                >

                  <div
                    className="
                      mb-2
                      flex
                      items-center
                      justify-between
                      gap-4
                      text-xs
                    "
                  >

                    <span
                      className="
                        font-medium
                        text-slate-500
                      "
                    >
                      {uploadProgress === 100
                        ? "Upload selesai"
                        : "Mengunggah ke Google Drive"}
                    </span>


                    <span
                      className="
                        font-bold
                        text-cyan-700
                      "
                    >
                      {uploadProgress}%
                    </span>

                  </div>


                  <div
                    className="
                      h-2
                      overflow-hidden
                      rounded-full
                      bg-slate-100
                    "
                  >

                    <div
                      className="
                        h-full
                        rounded-full
                        bg-cyan-600
                        transition-all
                        duration-300
                      "
                      style={{
                        width:
                          `${uploadProgress}%`,
                      }}
                    />

                  </div>

                </div>

              )}


              {/* ERROR */}

              {uploadError && (

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
                  {uploadError}
                </div>

              )}


              {/* SUCCESS */}

              {uploadSuccess && (

                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-4
                    py-3
                    text-xs
                    font-medium
                    leading-5
                    text-emerald-700
                  "
                >
                  {uploadSuccess}
                </div>

              )}


              {/* BUTTONS */}

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
                    uploading
                  }
                  onClick={
                    closeUpload
                  }
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
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  {uploadSuccess
                    ? "Tutup"
                    : "Batal"}
                </button>


                {!uploadSuccess && (

                  <button
                    type="button"
                    disabled={
                      uploading ||
                      !selectedFile
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
                      px-5
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

                    {uploading ? (

                      <Loader2
                        size={17}
                        className="
                          animate-spin
                        "
                      />

                    ) : (

                      <Upload
                        size={17}
                      />

                    )}


                    {uploading
                      ? "Mengunggah..."
                      : "Upload File"}

                  </button>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
}