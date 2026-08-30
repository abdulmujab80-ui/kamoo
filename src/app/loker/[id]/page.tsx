import Link from "next/link";

import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  notFound,
  redirect,
} from "next/navigation";

import LokerActions from "../components/LokerActions";
import FolderActions from "../components/FolderActions";
import FileActions from "../components/FileActions";


// ======================================================
// FILE ICON
// ======================================================

function getFileIcon(
  mimeType: string | null
) {
  if (
    mimeType?.startsWith("image/")
  ) {
    return (
      <FileImage size={20} />
    );
  }

  if (
    mimeType?.includes("spreadsheet") ||
    mimeType?.includes("excel")
  ) {
    return (
      <FileSpreadsheet size={20} />
    );
  }

  if (
    mimeType?.includes("pdf") ||
    mimeType?.includes("word") ||
    mimeType?.includes("document")
  ) {
    return (
      <FileText size={20} />
    );
  }

  if (
    mimeType?.includes("zip") ||
    mimeType?.includes("compressed")
  ) {
    return (
      <FileArchive size={20} />
    );
  }

  return (
    <File size={20} />
  );
}


// ======================================================
// FORMAT FILE SIZE
// ======================================================

function formatFileSize(
  size: number | null
) {
  if (
    size === null ||
    size < 0
  ) {
    return "Ukuran tidak tersedia";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (
    size <
    1024 * 1024
  ) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  if (
    size <
    1024 * 1024 * 1024
  ) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    size /
    (1024 * 1024 * 1024)
  ).toFixed(2)} GB`;
}


// ======================================================
// FORMAT UPDATED
// ======================================================

function formatUpdated(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone:
        "Asia/Jakarta",
    }
  ).format(value);
}


// ======================================================
// PAGE
// ======================================================

export default async function LokerFolderPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  const {
    id: folderId,
  } = await params;


  if (!folderId) {
    notFound();
  }


  // ====================================================
  // GET FOLDER
  // ====================================================

  const folder =
    await prisma.lokerFolder.findUnique({
      where: {
        id: folderId,
      },

      include: {
        loker: {
          select: {
            id: true,
            userId: true,

            user: {
              select: {
                nama: true,
                email: true,
              },
            },
          },
        },

        parent: {
          select: {
            id: true,
            nama: true,
            parentId: true,
          },
        },

        children: {
          orderBy: {
            nama: "asc",
          },
        },

        files: {
          orderBy: {
            updatedAt:
              "desc",
          },
        },
      },
    });


  if (!folder) {
    notFound();
  }


  // ====================================================
  // ACCESS CHECK
  // OWNER / VIEWER / EDITOR
  // ====================================================

  const userId =
    String(session.id);


  const isOwner =
    folder.loker.userId ===
    userId;


  const share =
    isOwner
      ? null
      : await prisma.lokerShare.findFirst({
          where: {
            lokerId:
              folder.lokerId,

            userId,
          },

          select: {
            permission:
              true,
          },
        });


  if (
    !isOwner &&
    !share
  ) {
    redirect("/loker");
  }


  const canEdit =
    isOwner ||
    share?.permission ===
      "EDITOR";


  // ====================================================
  // NAVIGATION
  // ====================================================

  const parentId =
    folder.parentId;


  const rootHref =
    isOwner
      ? "/loker"
      : `/loker/shared/${folder.lokerId}`;


  const rootLabel =
    isOwner
      ? "Loker"
      : "Loker Dibagikan";


  const backHref =
    parentId
      ? `/loker/${parentId}`
      : rootHref;


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        space-y-6
      "
    >

      {/* =================================================
          BACK
      ================================================= */}

      <Link
        href={backHref}
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-500
          transition
          hover:text-cyan-700
        "
      >
        <ArrowLeft
          size={17}
        />

        Kembali
      </Link>


      {/* =================================================
          HEADER
      ================================================= */}

      <section
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >

        <div className="min-w-0">

          {/* BREADCRUMB */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
              text-xs
              text-slate-400
            "
          >
            <Link
              href={rootHref}
              className="
                transition
                hover:text-cyan-700
              "
            >
              {rootLabel}
            </Link>


            <ChevronRight
              size={14}
            />


            {parentId &&
            folder.parent ? (
              <>
                <Link
                  href={`/loker/${folder.parent.id}`}
                  className="
                    max-w-[160px]
                    truncate
                    transition
                    hover:text-cyan-700
                  "
                >
                  {folder.parent.nama}
                </Link>

                <ChevronRight
                  size={14}
                />
              </>
            ) : null}


            <span
              className="
                max-w-[200px]
                truncate
                font-semibold
                text-slate-600
              "
            >
              {folder.nama}
            </span>
          </div>


          <p
            className="
              mt-4
              text-sm
              font-bold
              text-cyan-600
            "
          >
            Folder Loker
          </p>


          <h1
            className="
              mt-1
              truncate
              text-2xl
              font-extrabold
              tracking-tight
              text-slate-900
              sm:text-3xl
            "
          >
            {folder.nama}
          </h1>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            {folder.children.length} folder
            {" • "}
            {folder.files.length} file
          </p>

        </div>


        {canEdit && (
          <LokerActions
            lokerId={
              folder.lokerId
            }
            parentId={
              folder.id
            }
          />
        )}

      </section>


      {!isOwner && share && (
        <section
          className="
            flex
            flex-col
            gap-2
            rounded-2xl
            border
            border-cyan-100
            bg-cyan-50/70
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-sm
                font-bold
                text-slate-800
              "
            >
              Loker milik{" "}
              {
                folder.loker.user.nama
              }
            </p>

            <p
              className="
                mt-1
                truncate
                text-xs
                text-slate-500
              "
            >
              {
                folder.loker.user.email
              }
            </p>
          </div>

          <span
            className={`
              w-fit
              rounded-full
              px-3
              py-1.5
              text-[11px]
              font-extrabold
              ${
                share.permission ===
                "EDITOR"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-white text-slate-600"
              }
            `}
          >
            Anda sebagai{" "}
            {
              share.permission
            }
          </span>
        </section>
      )}


      {/* =================================================
          CONTENT
      ================================================= */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-6
          "
        >
          <h2
            className="
              text-base
              font-bold
              text-slate-900
              sm:text-lg
            "
          >
            Isi Folder
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
              sm:text-sm
            "
          >
            Folder dan berkas yang tersimpan
            di dalam folder ini.
          </p>
        </div>


        {/* =================================================
            EMPTY
        ================================================= */}

        {folder.children.length === 0 &&
        folder.files.length === 0 ? (

          <div
            className="
              flex
              min-h-[280px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-amber-50
                text-amber-500
              "
            >
              <Folder
                size={25}
              />
            </div>

            <h3
              className="
                mt-4
                text-sm
                font-bold
                text-slate-800
              "
            >
              Folder masih kosong
            </h3>

            <p
              className="
                mt-1
                max-w-sm
                text-sm
                leading-6
                text-slate-500
              "
            >
              Buat subfolder atau tambahkan
              file ke dalam folder ini.
            </p>

            <div className="mt-5">
              {canEdit ? (
                <LokerActions
                  lokerId={
                    folder.lokerId
                  }
                  parentId={
                    folder.id
                  }
                />
              ) : (
                <p
                  className="
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  Akses VIEWER — hanya dapat melihat isi Loker.
                </p>
              )}
            </div>
          </div>

        ) : (

          <>

            {/* =================================================
                DESKTOP
            ================================================= */}

            <div className="hidden md:block">

              {folder.children.map(
                (child) => (

                  <div
                    key={child.id}
                    className="
                      grid
                      grid-cols-[minmax(0,1fr)_auto]
                      items-center
                      gap-4
                      border-b
                      border-slate-100
                      px-6
                      py-4
                      transition
                      hover:bg-slate-50
                    "
                  >

                    <Link
                      href={`/loker/${child.id}`}
                      className="
                        group
                        flex
                        min-w-0
                        items-center
                        gap-4
                        rounded-xl
                        outline-none
                        focus:ring-2
                        focus:ring-cyan-200
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-amber-50
                          text-amber-500
                        "
                      >
                        <Folder
                          size={20}
                        />
                      </div>

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-800
                            transition
                            group-hover:text-cyan-700
                          "
                        >
                          {child.nama}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-xs
                            text-slate-400
                          "
                        >
                          Folder
                        </p>
                      </div>

                      <ChevronRight
                        size={17}
                        className="
                          shrink-0
                          text-slate-300
                          transition
                          group-hover:text-cyan-600
                        "
                      />
                    </Link>


                    {canEdit && (
                      <FolderActions
                        folderId={
                          child.id
                        }
                        nama={
                          child.nama
                        }
                      />
                    )}

                  </div>

                )
              )}


              {folder.files.map(
                (file) => (

                  <div
                    key={file.id}
                    className="
                      grid
                      grid-cols-[minmax(0,1fr)_auto]
                      items-center
                      gap-4
                      border-b
                      border-slate-100
                      px-6
                      py-4
                      transition
                      last:border-b-0
                      hover:bg-slate-50
                    "
                  >

                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-cyan-50
                          text-cyan-600
                        "
                      >
                        {getFileIcon(
                          file.mimeType
                        )}
                      </div>

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-800
                          "
                          title={
                            file.nama
                          }
                        >
                          {file.nama}
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            text-slate-400
                          "
                        >
                          {formatFileSize(
                            file.ukuran
                          )}
                          {" • "}
                          Diperbarui{" "}
                          {formatUpdated(
                            file.updatedAt
                          )}
                        </p>
                      </div>
                    </div>


                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-2
                      "
                    >
                      <a
                          href={`/api/loker/file/${file.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2
                            text-xs
                            font-bold
                            text-slate-600
                            transition
                            hover:border-cyan-200
                            hover:bg-cyan-50
                            hover:text-cyan-700
                          "
                        >
                          <ExternalLink
                            size={14}
                          />

                          Buka
                        </a>


                      {canEdit && (
                        <FileActions
                          fileId={
                            file.id
                          }
                          nama={
                            file.nama
                          }
                        />
                      )}
                    </div>

                  </div>

                )
              )}

            </div>


            {/* =================================================
                MOBILE
            ================================================= */}

            <div
              className="
                divide-y
                divide-slate-100
                md:hidden
              "
            >

              {folder.children.map(
                (child) => (

                  <div
                    key={child.id}
                    className="
                      flex
                      items-center
                      gap-2
                      p-4
                    "
                  >
                    <Link
                      href={`/loker/${child.id}`}
                      className="
                        group
                        flex
                        min-w-0
                        flex-1
                        items-center
                        gap-3
                        rounded-xl
                        outline-none
                        focus:ring-2
                        focus:ring-cyan-200
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
                        <Folder
                          size={20}
                        />
                      </div>

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-800
                            transition
                            group-hover:text-cyan-700
                          "
                        >
                          {child.nama}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          Folder
                        </p>
                      </div>

                      <ChevronRight
                        size={17}
                        className="
                          shrink-0
                          text-slate-300
                        "
                      />
                    </Link>


                    <div className="shrink-0">
                      {canEdit && (
                        <FolderActions
                          folderId={
                            child.id
                          }
                          nama={
                            child.nama
                          }
                        />
                      )}
                    </div>
                  </div>

                )
              )}


              {folder.files.map(
                (file) => (

                  <div
                    key={file.id}
                    className="
                      flex
                      items-center
                      gap-3
                      p-4
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
                      {getFileIcon(
                        file.mimeType
                      )}
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-slate-800
                        "
                        title={
                          file.nama
                        }
                      >
                        {file.nama}
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-xs
                          text-slate-400
                        "
                      >
                        {formatFileSize(
                          file.ukuran
                        )}
                      </p>
                    </div>


                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1
                      "
                    >
                      <a
                          href={`/api/loker/file/${file.id}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={
                            `Buka ${file.nama}`
                          }
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            text-slate-500
                            transition
                            hover:border-cyan-200
                            hover:bg-cyan-50
                            hover:text-cyan-700
                          "
                        >
                          <ExternalLink
                            size={15}
                          />
                        </a>


                      {canEdit && (
                        <FileActions
                          fileId={
                            file.id
                          }
                          nama={
                            file.nama
                          }
                          compact
                        />
                      )}
                    </div>
                  </div>

                )
              )}

            </div>

          </>

        )}

      </section>

    </div>
  );
}
