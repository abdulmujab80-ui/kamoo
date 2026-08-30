import Link from "next/link";

import {
  ChevronRight,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  History,
  ShieldCheck,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import LokerActions from "./components/LokerActions";
import FolderActions from "./components/FolderActions";
import FileActions from "./components/FileActions";
import LokerSharePanel from "./components/LokerSharePanel";


type SearchParams = {
  tab?: string;
};


// ======================================================
// FORMAT SIZE
// ======================================================

function formatSize(
  bytes: number | null | undefined
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "—";
  }

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
// FORMAT DATE
// ======================================================

function formatDate(
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


function formatDateTime(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "Asia/Jakarta",
    }
  ).format(value);
}


// ======================================================
// FILE ICON
// ======================================================

function getFileIcon(
  mimeType: string | null
) {
  if (
    mimeType?.startsWith(
      "image/"
    )
  ) {
    return (
      <FileImage size={20} />
    );
  }

  if (
    mimeType?.includes(
      "spreadsheet"
    ) ||
    mimeType?.includes(
      "excel"
    )
  ) {
    return (
      <FileSpreadsheet size={20} />
    );
  }

  if (
    mimeType?.includes("pdf") ||
    mimeType?.includes("word") ||
    mimeType?.includes(
      "document"
    )
  ) {
    return (
      <FileText size={20} />
    );
  }

  if (
    mimeType?.includes("zip") ||
    mimeType?.includes(
      "compressed"
    )
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
// PAGE
// ======================================================

export default async function LokerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session =
    await getSession();


  if (!session) {
    redirect("/login");
  }


  const userId =
    String(session.id);


  const params =
    await searchParams;


  const activeTab =
    params.tab === "shared"
      ? "shared"
      : "mine";


  // ====================================================
  // OWN LOKER
  // ====================================================

  let loker =
    await prisma.loker.findUnique({
      where: {
        userId,
      },

      include: {
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

        shares: {
          include: {
            user: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },
        },
      },
    });


  if (!loker) {
    loker =
      await prisma.loker.create({
        data: {
          userId,
        },

        include: {
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

          shares: {
            include: {
              user: {
                select: {
                  id: true,
                  nama: true,
                  email: true,
                },
              },
            },

            orderBy: {
              createdAt:
                "desc",
            },
          },
        },
      });
  }


  // ====================================================
  // DATA PENDUKUNG
  // ====================================================

  const [
    totalFolder,
    totalFile,
    totalSize,
    availableUsers,
    sharedWithMe,
    recentAudit,
  ] = await Promise.all([
    prisma.lokerFolder.count({
      where: {
        lokerId:
          loker.id,
      },
    }),

    prisma.lokerFile.count({
      where: {
        lokerId:
          loker.id,
      },
    }),

    prisma.lokerFile.aggregate({
      where: {
        lokerId:
          loker.id,
      },

      _sum: {
        ukuran: true,
      },
    }),

    prisma.user.findMany({
      where: {
        id: {
          not:
            userId,
        },

        aktif:
          true,
      },

      select: {
        id: true,
        nama: true,
        email: true,
      },

      orderBy: {
        nama:
          "asc",
      },
    }),

    prisma.lokerShare.findMany({
      where: {
        userId,
      },

      include: {
        loker: {
          select: {
            id: true,

            user: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },

            _count: {
              select: {
                folders: true,
                files: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },
    }),

    prisma.auditLog.findMany({
      where: {
        modul:
          "LOKER",

        dataId:
          loker.id,
      },

      include: {
        user: {
          select: {
            nama: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take:
        12,
    }),
  ]);


  const usedSize =
    totalSize._sum.ukuran ??
    0;


  const hasOwnContent =
    loker.folders.length > 0 ||
    loker.files.length > 0;


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        space-y-6
        sm:space-y-7
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

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
          <p
            className="
              text-sm
              font-bold
              text-cyan-600
            "
          >
            Ruang Kerja Pribadi
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
            Loker
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
              sm:text-base
            "
          >
            Simpan, kelola, dan bagikan berkas
            kerja organisasi secara terkontrol.
          </p>
        </div>


        {activeTab ===
          "mine" && (
          <LokerActions
            lokerId={
              loker.id
            }
          />
        )}
      </section>


      {/* ==================================================
          HERO
      ================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-teal-600
          via-cyan-600
          to-cyan-500
          p-5
          text-white
          shadow-xl
          shadow-cyan-100
          sm:p-7
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-56
            w-56
            rounded-full
            bg-white/10
          "
        />

        <div
          className="
            relative
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-[1.25fr_1fr]
            lg:items-center
          "
        >
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white/10
                px-3
                py-1.5
                text-xs
                font-semibold
                backdrop-blur
              "
            >
              <ShieldCheck
                size={14}
              />

              Akses terkontrol
            </div>

            <h2
              className="
                mt-4
                text-xl
                font-extrabold
                tracking-tight
                sm:text-2xl
              "
            >
              Dokumen kerja KAMOO dalam
              satu ruang yang rapi.
            </h2>

            <p
              className="
                mt-2
                max-w-xl
                text-sm
                leading-6
                text-white/80
              "
            >
              Loker milik Anda tetap privat.
              Berikan akses VIEWER atau EDITOR
              hanya kepada pengguna yang diperlukan.
            </p>
          </div>


          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            <OverviewCard
              label="Folder"
              value={
                String(
                  totalFolder
                )
              }
            />

            <OverviewCard
              label="File"
              value={
                String(
                  totalFile
                )
              }
            />

            <OverviewCard
              label="Terpakai"
              value={
                formatSize(
                  usedSize
                )
              }
            />

            <OverviewCard
              label="Dibagikan"
              value={
                String(
                  loker.shares.length
                )
              }
            />
          </div>
        </div>
      </section>


      {/* ==================================================
          TAB
      ================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-1.5
          shadow-sm
        "
      >
        <div
          className="
            grid
            grid-cols-2
            gap-1
          "
        >
          <Link
            href="/loker"
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-3
              text-sm
              font-bold
              transition
              ${
                activeTab ===
                "mine"
                  ? "bg-cyan-50 text-cyan-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }
            `}
          >
            <FolderOpen
              size={17}
            />

            Loker Saya
          </Link>

          <Link
            href="/loker?tab=shared"
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-3
              text-sm
              font-bold
              transition
              ${
                activeTab ===
                "shared"
                  ? "bg-cyan-50 text-cyan-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }
            `}
          >
            <Users
              size={17}
            />

            Dibagikan kepada Saya

            {sharedWithMe.length >
              0 && (
              <span
                className="
                  rounded-full
                  bg-white
                  px-2
                  py-0.5
                  text-[10px]
                  font-extrabold
                  shadow-sm
                "
              >
                {
                  sharedWithMe.length
                }
              </span>
            )}
          </Link>
        </div>
      </section>


      {activeTab ===
      "mine" ? (
        <>

          {/* ==================================================
              OWN WORKSPACE
          ================================================== */}

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
                Loker Saya
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                  sm:text-sm
                "
              >
                Folder dan file utama Anda.
              </p>
            </div>


            {!hasOwnContent ? (
              <EmptyState />
            ) : (
              <>
                {/* DESKTOP */}

                <div className="hidden md:block">

                  {loker.folders.map(
                    (folder) => (
                      <div
                        key={
                          folder.id
                        }
                        className="
                          grid
                          grid-cols-[minmax(0,1fr)_150px_110px]
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
                          href={`/loker/${folder.id}`}
                          className="
                            group
                            flex
                            min-w-0
                            items-center
                            gap-3
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

                          <div className="min-w-0">
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
                              {
                                folder.nama
                              }
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
                        </Link>


                        <p
                          className="
                            text-sm
                            text-slate-500
                          "
                        >
                          {formatDate(
                            folder.updatedAt
                          )}
                        </p>


                        <div
                          className="
                            flex
                            items-center
                            justify-end
                            gap-2
                          "
                        >
                          <FolderActions
                            folderId={
                              folder.id
                            }
                            nama={
                              folder.nama
                            }
                          />

                          <ChevronRight
                            size={17}
                            className="
                              text-slate-300
                            "
                          />
                        </div>
                      </div>
                    )
                  )}


                  {loker.files.map(
                    (file) => (
                      <div
                        key={
                          file.id
                        }
                        className="
                          grid
                          grid-cols-[minmax(0,1fr)_150px_110px]
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
                            gap-3
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

                          <div className="min-w-0">
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
                              {
                                file.nama
                              }
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-xs
                                text-slate-400
                              "
                            >
                              {formatSize(
                                file.ukuran
                              )}
                            </p>
                          </div>
                        </div>


                        <p
                          className="
                            text-sm
                            text-slate-500
                          "
                        >
                          {formatDate(
                            file.updatedAt
                          )}
                        </p>


                        <div
                          className="
                            flex
                            items-center
                            justify-end
                            gap-1.5
                          "
                        >
                          <a
                              href={`/api/loker/file/${file.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Buka file"
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

                          <FileActions
                            fileId={
                              file.id
                            }
                            nama={
                              file.nama
                            }
                            compact
                          />
                        </div>
                      </div>
                    )
                  )}

                </div>


                {/* MOBILE */}

                <div
                  className="
                    divide-y
                    divide-slate-100
                    md:hidden
                  "
                >
                  {loker.folders.map(
                    (folder) => (
                      <div
                        key={
                          folder.id
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          p-4
                        "
                      >
                        <Link
                          href={`/loker/${folder.id}`}
                          className="
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
                              {" • "}
                              {formatDate(
                                folder.updatedAt
                              )}
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

                        <FolderActions
                          folderId={
                            folder.id
                          }
                          nama={
                            folder.nama
                          }
                        />
                      </div>
                    )
                  )}


                  {loker.files.map(
                    (file) => (
                      <div
                        key={
                          file.id
                        }
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
                          >
                            {
                              file.nama
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              text-slate-400
                            "
                          >
                            {formatSize(
                              file.ukuran
                            )}
                            {" • "}
                            {formatDate(
                              file.updatedAt
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

                          <FileActions
                            fileId={
                              file.id
                            }
                            nama={
                              file.nama
                            }
                            compact
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </section>


          {/* ==================================================
              SHARE PANEL
          ================================================== */}

          <LokerSharePanel
            lokerId={
              loker.id
            }
            users={
              availableUsers
            }
            shares={
              loker.shares.map(
                (share) => ({
                  id:
                    share.id,

                  userId:
                    share.userId,

                  permission:
                    share.permission,

                  user:
                    share.user,
                })
              )
            }
          />


          {/* ==================================================
              AUDIT TRAIL
          ================================================== */}

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
                flex
                items-start
                gap-3
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
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                "
              >
                <History
                  size={20}
                />
              </div>

              <div>
                <h2
                  className="
                    text-base
                    font-bold
                    text-slate-900
                    sm:text-lg
                  "
                >
                  Aktivitas Loker
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                    sm:text-sm
                  "
                >
                  Riwayat perubahan terbaru,
                  termasuk aktivitas EDITOR.
                </p>
              </div>
            </div>


            {recentAudit.length ===
            0 ? (
              <div
                className="
                  px-5
                  py-8
                  text-center
                  text-sm
                  text-slate-500
                  sm:px-6
                "
              >
                Belum ada aktivitas Loker
                yang tercatat dengan audit baru.
              </div>
            ) : (
              <div
                className="
                  divide-y
                  divide-slate-100
                "
              >
                {recentAudit.map(
                  (audit) => (
                    <div
                      key={
                        audit.id
                      }
                      className="
                        flex
                        flex-col
                        gap-1
                        px-5
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:gap-4
                        sm:px-6
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                        >
                          {
                            audit.aktivitas
                          }
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-500
                          "
                        >
                          Oleh{" "}
                          <span
                            className="
                              font-semibold
                              text-slate-600
                            "
                          >
                            {
                              audit.user.nama
                            }
                          </span>
                          {" • "}
                          {
                            String(
                              audit.user.role
                            )
                          }
                        </p>
                      </div>

                      <p
                        className="
                          shrink-0
                          text-xs
                          text-slate-400
                        "
                      >
                        {formatDateTime(
                          audit.createdAt
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

        </>
      ) : (

        /* ==================================================
            SHARED WITH ME
        ================================================== */

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
              Dibagikan kepada Saya
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
                sm:text-sm
              "
            >
              Loker milik pengguna lain
              yang memberikan akses kepada Anda.
            </p>
          </div>


          {sharedWithMe.length ===
          0 ? (
            <div
              className="
                flex
                min-h-[270px]
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
                  bg-cyan-50
                  text-cyan-600
                "
              >
                <Users
                  size={24}
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
                Belum ada Loker dibagikan
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
                Loker yang dibagikan kepada
                akun Anda akan muncul di sini.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                gap-3
                p-5
                sm:grid-cols-2
                sm:p-6
                xl:grid-cols-3
              "
            >
              {sharedWithMe.map(
                (share) => (
                  <Link
                    key={
                      share.id
                    }
                    href={`/loker/shared/${share.lokerId}`}
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-5
                      transition
                      hover:-translate-y-0.5
                      hover:border-cyan-200
                      hover:shadow-md
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          bg-cyan-50
                          text-cyan-600
                        "
                      >
                        <FolderOpen
                          size={20}
                        />
                      </div>

                      <span
                        className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-extrabold
                          ${
                            share.permission ===
                            "EDITOR"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }
                        `}
                      >
                        {
                          share.permission
                        }
                      </span>
                    </div>

                    <p
                      className="
                        mt-4
                        truncate
                        text-sm
                        font-extrabold
                        text-slate-900
                        transition
                        group-hover:text-cyan-700
                      "
                    >
                      Loker{" "}
                      {
                        share.loker.user.nama
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
                        share.loker.user.email
                      }
                    </p>

                    <p
                      className="
                        mt-4
                        text-xs
                        text-slate-400
                      "
                    >
                      {
                        share.loker._count.folders
                      }{" "}
                      folder
                      {" • "}
                      {
                        share.loker._count.files
                      }{" "}
                      file
                    </p>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      )}

    </div>
  );
}


// ======================================================
// OVERVIEW CARD
// ======================================================

function OverviewCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/10
        px-4
        py-3
        backdrop-blur
      "
    >
      <p
        className="
          text-[11px]
          font-medium
          text-white/65
        "
      >
        {label}
      </p>

      <p
        className="
          mt-0.5
          truncate
          text-sm
          font-extrabold
          text-white
        "
      >
        {value}
      </p>
    </div>
  );
}


// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-[300px]
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
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-cyan-50
          text-cyan-600
        "
      >
        <Folder
          size={28}
        />
      </div>

      <h3
        className="
          mt-5
          text-sm
          font-bold
          text-slate-800
        "
      >
        Loker masih kosong
      </h3>

      <p
        className="
          mt-2
          max-w-sm
          text-sm
          leading-6
          text-slate-500
        "
      >
        Mulai dengan membuat folder
        atau mengunggah file.
      </p>
    </div>
  );
}
