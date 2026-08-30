import {
  NextResponse,
} from "next/server";

import {
  getSession,
} from "@/lib/auth";

import {
  prisma,
} from "@/lib/prisma";

import {
  getGoogleAccessToken,
  getGoogleDriveRootFolderId,
} from "@/lib/google-drive";


// ======================================================
// CONFIG
// ======================================================

const MAX_FILE_SIZE =
  100 * 1024 * 1024;


// ======================================================
// REQUEST TYPE
// ======================================================

type UploadRequest = {
  lokerId?: string;
  folderId?: string | null;

  name?: string;
  mimeType?: string;

  size?: number;
};


// ======================================================
// CREATE RESUMABLE SESSION
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

    const body =
      (await request.json()) as UploadRequest;


    const lokerId =
      String(
        body.lokerId ?? ""
      ).trim();


    const folderId =
      body.folderId
        ? String(
            body.folderId
          ).trim()
        : null;


    const name =
      String(
        body.name ?? ""
      ).trim();


    const mimeType =
      String(
        body.mimeType ??
          "application/octet-stream"
      ).trim();


    const size =
      Number(
        body.size ?? 0
      );


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!lokerId) {
      return NextResponse.json(
        {
          error:
            "Loker tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }


    if (!name) {
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


    // ==================================================
    // OWNERSHIP
    // ==================================================

    const loker =
      await prisma.loker.findUnique({
        where: {
          id: lokerId,
        },

        select: {
          id: true,
          userId: true,
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


    if (
      loker.userId !==
      String(session.id)
    ) {
      return NextResponse.json(
        {
          error:
            "Anda tidak memiliki akses ke Loker ini.",
        },
        {
          status: 403,
        }
      );
    }


    // ==================================================
    // VALIDATE KAMOO FOLDER
    // ==================================================

    if (folderId) {

      const folder =
        await prisma.lokerFolder.findUnique({
          where: {
            id: folderId,
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
    // GOOGLE AUTH
    // ==================================================

    const accessToken =
      await getGoogleAccessToken();


    const rootFolderId =
      getGoogleDriveRootFolderId();


    // ==================================================
    // CREATE GOOGLE RESUMABLE SESSION
    // ==================================================

    const googleResponse =
      await fetch(
        [
          "https://www.googleapis.com/upload/drive/v3/files",
          "?uploadType=resumable",
          "&fields=id,name,mimeType,size,webViewLink,webContentLink",
        ].join(""),
        {
          method: "POST",

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

          body: JSON.stringify({
            name,

            parents: [
              rootFolderId,
            ],

            appProperties: {
              kamooLokerId:
                loker.id,

              kamooUserId:
                String(
                  session.id
                ),

              kamooFolderId:
                folderId ??
                "ROOT",
            },
          }),
        }
      );


    if (
      !googleResponse.ok
    ) {

      const googleError =
        await googleResponse.text();


      console.error(
        "Google resumable session error:",
        googleError
      );


      return NextResponse.json(
        {
          error:
            "Gagal membuat sesi upload Google Drive.",
        },
        {
          status: 502,
        }
      );

    }


    const uploadUrl =
      googleResponse.headers.get(
        "location"
      );


    if (!uploadUrl) {
      return NextResponse.json(
        {
          error:
            "Google Drive tidak mengembalikan upload URL.",
        },
        {
          status: 502,
        }
      );
    }


    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      uploadUrl,
    });

  } catch (error) {

    console.error(
      "Create upload session error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat menyiapkan upload.",
      },
      {
        status: 500,
      }
    );

  }
}