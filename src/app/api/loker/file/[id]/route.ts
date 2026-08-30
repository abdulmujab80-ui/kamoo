import {
  NextResponse,
} from "next/server";

import {
  Readable,
} from "node:stream";

import {
  getSession,
} from "@/lib/auth";

import {
  prisma,
} from "@/lib/prisma";

import {
  createGoogleDriveClient,
} from "@/lib/google-drive";


export const runtime =
  "nodejs";


type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// SAFE FILE NAME
// ======================================================

function getDisposition(
  fileName: string,
  download: boolean
) {
  const fallback =
    fileName
      .replace(
        /[^\x20-\x7E]/g,
        "_"
      )
      .replace(
        /["\\]/g,
        "_"
      );


  const type =
    download
      ? "attachment"
      : "inline";


  return `${type}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(
    fileName
  )}`;
}


// ======================================================
// OPEN / DOWNLOAD FILE
// KAMOO permission -> Google Drive stream
// ======================================================

export async function GET(
  request: Request,
  {
    params,
  }: RouteProps
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


  const {
    id: fileId,
  } = await params;


  if (!fileId) {
    return NextResponse.json(
      {
        error:
          "File tidak ditemukan.",
      },
      {
        status: 404,
      }
    );
  }


  const userId =
    String(
      session.id
    );


  const file =
    await prisma.lokerFile.findUnique({
      where: {
        id:
          fileId,
      },

      select: {
        id: true,
        nama: true,
        ukuran: true,
        mimeType: true,
        storageId: true,
        storageProvider: true,

        loker: {
          select: {
            userId: true,

            shares: {
              where: {
                userId,
              },

              select: {
                id: true,
              },

              take:
                1,
            },
          },
        },
      },
    });


  if (!file) {
    return NextResponse.json(
      {
        error:
          "File tidak ditemukan.",
      },
      {
        status: 404,
      }
    );
  }


  const hasAccess =
    file.loker.userId ===
      userId ||
    file.loker.shares.length >
      0;


  if (!hasAccess) {
    return NextResponse.json(
      {
        error:
          "Anda tidak memiliki akses ke file ini.",
      },
      {
        status: 403,
      }
    );
  }


  if (
    file.storageProvider !==
      "GOOGLE_DRIVE" ||
    !file.storageId
  ) {
    return NextResponse.json(
      {
        error:
          "Storage file tidak valid.",
      },
      {
        status: 409,
      }
    );
  }


  try {
    const drive =
      createGoogleDriveClient();


    const googleResponse =
      await drive.files.get(
        {
          fileId:
            file.storageId,

          alt:
            "media",
        },
        {
          responseType:
            "stream",
        }
      );


    const nodeStream =
      googleResponse.data as unknown as Readable;


    const webStream =
      Readable.toWeb(
        nodeStream
      ) as ReadableStream<Uint8Array>;


    const url =
      new URL(
        request.url
      );


    const download =
      url.searchParams.get(
        "download"
      ) === "1";


    const headers =
      new Headers();


    headers.set(
      "Content-Type",
      file.mimeType ||
        "application/octet-stream"
    );


    headers.set(
      "Content-Disposition",
      getDisposition(
        file.nama,
        download
      )
    );


    if (
      file.ukuran !==
        null
    ) {
      headers.set(
        "Content-Length",
        String(
          file.ukuran
        )
      );
    }


    headers.set(
      "Cache-Control",
      "private, no-store, max-age=0"
    );


    headers.set(
      "X-Content-Type-Options",
      "nosniff"
    );


    headers.set(
      "Cross-Origin-Resource-Policy",
      "same-origin"
    );


    return new Response(
      webStream,
      {
        status:
          200,

        headers,
      }
    );

  } catch (error) {
    console.error(
      "Secure Loker file stream error:",
      error
    );


    const status =
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error &&
      (
        error as {
          code?: unknown;
        }
      ).code === 404
        ? 404
        : 502;


    return NextResponse.json(
      {
        error:
          status === 404
            ? "File tidak ditemukan di Google Drive."
            : "File gagal dibuka dari Google Drive.",
      },
      {
        status,
      }
    );
  }
}
