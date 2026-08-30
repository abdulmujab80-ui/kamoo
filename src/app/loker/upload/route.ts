import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  getGoogleAccessToken,
  getGoogleDriveRootFolderId,
} from "@/lib/google-drive";


export const runtime =
  "nodejs";


const MAX_FILE_SIZE =
  100 * 1024 * 1024;


type GoogleDriveFile = {
  id?: string;
  name?: string;
  mimeType?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
};


// ======================================================
// UPLOAD
// OWNER / EDITOR
// ======================================================

export async function POST(
  request: Request
) {
  const session =
    await getSession();


  if (!session) {
    return NextResponse.json(
      {
        error:
          "Anda belum login.",
      },
      {
        status: 401,
      }
    );
  }


  try {
    const userId =
      String(
        session.id
      );


    // ==================================================
    // SAME-ORIGIN HARDENING
    // ==================================================

    const requestOrigin =
      request.headers.get(
        "origin"
      );


    const appUrl =
      process.env
        .NEXT_PUBLIC_APP_URL
        ?.trim();


    if (
      requestOrigin &&
      appUrl
    ) {
      try {
        const allowedOrigin =
          new URL(
            appUrl
          ).origin;


        if (
          requestOrigin !==
          allowedOrigin
        ) {
          return NextResponse.json(
            {
              error:
                "Origin request tidak diizinkan.",
            },
            {
              status: 403,
            }
          );
        }

      } catch {
        console.error(
          "NEXT_PUBLIC_APP_URL tidak valid."
        );
      }
    }


    // ==================================================
    // METADATA
    // ==================================================

    const lokerId =
      request.headers
        .get(
          "x-kamoo-loker-id"
        )
        ?.trim() ?? "";


    const folderIdRaw =
      request.headers.get(
        "x-kamoo-folder-id"
      );


    const folderId =
      folderIdRaw &&
      folderIdRaw !== "ROOT"
        ? folderIdRaw.trim()
        : null;


    const encodedFileName =
      request.headers.get(
        "x-kamoo-file-name"
      ) ?? "";


    let fileName = "";


    try {
      fileName =
        decodeURIComponent(
          encodedFileName
        ).trim();
    } catch {
      return NextResponse.json(
        {
          error:
            "Nama file tidak valid.",
        },
        {
          status: 400,
        }
      );
    }


    const mimeType =
      request.headers.get(
        "content-type"
      )?.trim() ||
      "application/octet-stream";


    const size =
      Number(
        request.headers.get(
          "x-kamoo-file-size"
        ) ??
          request.headers.get(
            "content-length"
          ) ??
          0
      );


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !lokerId ||
      !fileName
    ) {
      return NextResponse.json(
        {
          error:
            "Data upload tidak lengkap.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      fileName.length >
      255
    ) {
      return NextResponse.json(
        {
          error:
            "Nama file terlalu panjang.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Ukuran file tidak valid.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Ukuran file maksimal 100 MB.",
        },
        {
          status: 413,
        }
      );
    }


    if (!request.body) {
      return NextResponse.json(
        {
          error:
            "Isi file tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }


    // ==================================================
    // OWNER / EDITOR CHECK
    // ==================================================

    const loker =
      await prisma.loker.findUnique({
        where: {
          id:
            lokerId,
        },

        select: {
          id: true,
          userId: true,

          shares: {
            where: {
              userId,

              permission:
                "EDITOR",
            },

            select: {
              id: true,
            },

            take:
              1,
          },
        },
      });


    if (!loker) {
      return NextResponse.json(
        {
          error:
            "Loker tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }


    const canEdit =
      loker.userId ===
        userId ||
      loker.shares.length >
        0;


    if (!canEdit) {
      return NextResponse.json(
        {
          error:
            "Anda tidak memiliki akses EDITOR ke Loker ini.",
        },
        {
          status: 403,
        }
      );
    }


    // ==================================================
    // FOLDER CHECK
    // ==================================================

    if (folderId) {
      const folder =
        await prisma.lokerFolder.findUnique({
          where: {
            id:
              folderId,
          },

          select: {
            id: true,
            lokerId: true,
          },
        });


      if (
        !folder ||
        folder.lokerId !==
          loker.id
      ) {
        return NextResponse.json(
          {
            error:
              "Folder tujuan tidak valid.",
          },
          {
            status: 400,
          }
        );
      }
    }


    // ==================================================
    // DUPLICATE NAME CHECK
    // ==================================================

    const duplicateFile =
      await prisma.lokerFile.findFirst({
        where: {
          lokerId:
            loker.id,

          folderId,

          nama:
            fileName,
        },

        select: {
          id: true,
        },
      });


    if (duplicateFile) {
      return NextResponse.json(
        {
          error:
            "File dengan nama tersebut sudah ada di folder ini.",
        },
        {
          status: 409,
        }
      );
    }


    // ==================================================
    // GOOGLE ACCESS
    // ==================================================

    const accessToken =
      await getGoogleAccessToken();


    const rootFolderId =
      getGoogleDriveRootFolderId();


    // ==================================================
    // CREATE RESUMABLE SESSION
    // ==================================================

    const createResponse =
      await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink,webContentLink",
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json; charset=UTF-8",

            "X-Upload-Content-Type":
              mimeType,

            "X-Upload-Content-Length":
              String(size),
          },

          body:
            JSON.stringify({
              name:
                fileName,

              parents: [
                rootFolderId,
              ],

              appProperties: {
                kamooLokerId:
                  loker.id,

                kamooUserId:
                  userId,

                kamooFolderId:
                  folderId ??
                  "ROOT",
              },
            }),
        }
      );


    if (
      !createResponse.ok
    ) {
      const googleError =
        await createResponse.text();


      console.error(
        "Google create upload:",
        googleError
      );


      return NextResponse.json(
        {
          error:
            "Google Drive gagal membuat sesi upload.",
        },
        {
          status: 502,
        }
      );
    }


    const uploadUrl =
      createResponse.headers.get(
        "location"
      );


    if (!uploadUrl) {
      return NextResponse.json(
        {
          error:
            "Upload URL Google tidak ditemukan.",
        },
        {
          status: 502,
        }
      );
    }


    // ==================================================
    // STREAM KAMOO -> GOOGLE
    // ==================================================

    const uploadOptions:
      RequestInit & {
        duplex: "half";
      } = {
        method:
          "PUT",

        headers: {
          "Content-Type":
            mimeType,

          "Content-Length":
            String(size),
        },

        body:
          request.body,

        duplex:
          "half",
      };


    const driveResponse =
      await fetch(
        uploadUrl,
        uploadOptions
      );


    if (
      !driveResponse.ok
    ) {
      const googleError =
        await driveResponse.text();


      console.error(
        "Google upload file:",
        googleError
      );


      return NextResponse.json(
        {
          error:
            `Google Drive gagal menerima file (${driveResponse.status}).`,
        },
        {
          status: 502,
        }
      );
    }


    const driveFile =
      (
        await driveResponse.json()
      ) as GoogleDriveFile;


    if (!driveFile.id) {
      return NextResponse.json(
        {
          error:
            "Google Drive tidak mengembalikan File ID.",
        },
        {
          status: 502,
        }
      );
    }


    const driveFileId =
      driveFile.id;


    const finalName =
      driveFile.name?.trim() ||
      fileName;


    const finalMimeType =
      driveFile.mimeType?.trim() ||
      mimeType;


    const googleSize =
      Number(
        driveFile.size ??
        size
      );


    const finalSize =
      Number.isFinite(
        googleSize
      ) &&
      googleSize > 0
        ? Math.trunc(
            googleSize
          )
        : Math.trunc(
            size
          );


    const storageUrl =
      driveFile.webViewLink ??
      `https://drive.google.com/file/d/${driveFileId}/view`;


    let savedFile;


    try {
      savedFile =
        await prisma.$transaction(
          async (tx) => {
            const createdFile =
              await tx.lokerFile.create({
                data: {
                  lokerId:
                    loker.id,

                  folderId,

                  nama:
                    finalName,

                  storageProvider:
                    "GOOGLE_DRIVE",

                  storageId:
                    driveFileId,

                  storageUrl,

                  ukuran:
                    finalSize,

                  mimeType:
                    finalMimeType,
                },
              });


            await tx.auditLog.create({
              data: {
                userId,

                modul:
                  "LOKER",

                dataId:
                  loker.id,

                aktivitas:
                  `Mengunggah file Loker "${finalName}"`,
              },
            });


            return createdFile;
          }
        );

    } catch (databaseError) {

      try {
        const cleanupResponse =
          await fetch(
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
              driveFileId
            )}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            }
          );


        if (
          !cleanupResponse.ok
        ) {
          console.error(
            "Google cleanup gagal:",
            await cleanupResponse.text()
          );
        }

      } catch (
        cleanupError
      ) {
        console.error(
          "Google cleanup error:",
          cleanupError
        );
      }


      console.error(
        "Loker database save error:",
        databaseError
      );


      throw new Error(
        "File berhasil dikirim ke Google Drive, tetapi metadata gagal disimpan ke KAMOO."
      );
    }


    revalidatePath(
      "/loker"
    );


    if (folderId) {
      revalidatePath(
        `/loker/${folderId}`
      );
    }


    revalidatePath(
      `/loker/shared/${loker.id}`
    );


    return NextResponse.json({
      success:
        true,

      file: {
        id:
          driveFileId,

        name:
          finalName,

        mimeType:
          finalMimeType,

        size:
          finalSize,

        webViewLink:
          storageUrl,

        webContentLink:
          driveFile.webContentLink ??
          null,
      },

      lokerFile:
        savedFile,
    });

  } catch (error) {

    console.error(
      "Loker upload error:",
      error
    );


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload file gagal.",
      },
      {
        status: 500,
      }
    );
  }
}
