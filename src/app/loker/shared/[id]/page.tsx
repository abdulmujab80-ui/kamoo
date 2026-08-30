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
  FolderOpen,
  ShieldCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

import {
  notFound,
  redirect,
} from "next/navigation";

import LokerActions from "../../components/LokerActions";
import FolderActions from "../../components/FolderActions";
import FileActions from "../../components/FileActions";


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
// FORMAT SIZE
// ======================================================

function formatSize(
  value: number | null
) {
  if (
    value === null
  ) {
    return "—";
  }

  if (
    value < 1024
  ) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}


// ======================================================
// PAGE
// ======================================================

export default async function SharedLokerPage({
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
    id: lokerId,
  } = await params;


  if (!lokerId) {
    notFound();
  }


  const userId =
    String(session.id);


  const share =
    await prisma.lokerShare.findFirst({
      where: {
        lokerId,
        userId,
      },

      include: {
        loker: {
          include: {
            user: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },

            folders: {
              where: {
                parentId: null,
              },

              orderBy: {
                nama: "asc",
              },
            },

            files: {
              where: {
                folderId: null,
              },

              orderBy: {
                updatedAt:
                  "desc",
              },
            },
          },
        },
      },
    });


  if (!share) {
    redirect(
      "/loker?tab=shared"
    );
  }


  const canEdit =
    share.permission ===
    "EDITOR";


  const hasContent =
    share.loker.folders.length >
      0 ||
    share.loker.files.length >
      0;


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        space-y-6
      "
    >
      <Link
        href="/loker?tab=shared"
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

        Kembali ke Loker Dibagikan
      </Link>


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
              href="/loker?tab=shared"
              className="
                hover:text-cyan-700
              "
            >
              Dibagikan kepada Saya
            </Link>

            <ChevronRight
              size={14}
            />

            <span
              className="
                font-semibold
                text-slate-600
              "
            >
              {
                share.loker.user.nama
              }
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
            Loker Dibagikan
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-extrabold
              tracking-tight
              text-slate-900
              sm:text-3xl
            "
          >
            Loker{" "}
            {
              share.loker.user.nama
            }
          </h1>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-extrabold
                ${
                  canEdit
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {
                share.permission
              }
            </span>

            <span
              className="
                text-xs
                text-slate-500
              "
            >
              {
                share.loker.user.email
              }
            </span>
          </div>
        </div>


        {canEdit && (
          <LokerActions
            lokerId={
              share.loker.id
            }
          />
        )}
      </section>


      <section
        className="
          rounded-2xl
          border
          border-cyan-100
          bg-cyan-50/70
          px-5
          py-4
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <ShieldCheck
            size={18}
            className="
              mt-0.5
              shrink-0
              text-cyan-600
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-slate-600
            "
          >
            {canEdit
              ? "Anda memiliki akses EDITOR: dapat membuka, upload, membuat folder, rename, dan menghapus isi Loker ini."
              : "Anda memiliki akses VIEWER: dapat melihat folder dan membuka file, tanpa mengubah isi Loker."}
          </p>
        </div>
      </section>


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
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-cyan-50
                text-cyan-600
              "
            >
              <FolderOpen
                size={19}
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
                Isi Loker
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                {
                  share.loker.folders.length
                }{" "}
                folder
                {" • "}
                {
                  share.loker.files.length
                }{" "}
                file di root
              </p>
            </div>
          </div>
        </div>


        {!hasContent ? (
          <div
            className="
              flex
              min-h-[260px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >
            <Folder
              size={28}
              className="
                text-amber-400
              "
            />

            <p
              className="
                mt-4
                text-sm
                font-bold
                text-slate-700
              "
            >
              Loker masih kosong
            </p>
          </div>
        ) : (
          <div
            className="
              divide-y
              divide-slate-100
            "
          >
            {share.loker.folders.map(
              (folder) => (
                <div
                  key={
                    folder.id
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-4
                    sm:px-6
                  "
                >
                  <Link
                    href={`/loker/${folder.id}`}
                    className="
                      group
                      flex
                      min-w-0
                      flex-1
                      items-center
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
                          group-hover:text-cyan-700
                        "
                      >
                        {
                          folder.nama
                        }
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
                        text-slate-300
                      "
                    />
                  </Link>


                  {canEdit && (
                    <FolderActions
                      folderId={
                        folder.id
                      }
                      nama={
                        folder.nama
                      }
                    />
                  )}
                </div>
              )
            )}


            {share.loker.files.map(
              (file) => (
                <div
                  key={
                    file.id
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-4
                    sm:px-6
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
                    >
                      {
                        file.nama
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      {formatSize(
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
        )}
      </section>
    </div>
  );
}
