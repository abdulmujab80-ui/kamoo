import {
  NextResponse,
} from "next/server";

import {
  randomUUID,
} from "node:crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  getSession,
} from "@/lib/auth";

import {
  prisma,
} from "@/lib/prisma";

import {
  getAvatarBucket,
  getPublicAvatarUrl,
  getSupabaseAdmin,
} from "@/lib/supabase-storage";


export const runtime =
  "nodejs";


const MAX_AVATAR_SIZE =
  2 * 1024 * 1024;


const ALLOWED_MIME_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


// ======================================================
// HELPERS
// ======================================================

function getExtension(
  mimeType: string
) {
  switch (
    mimeType
  ) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return null;
  }
}


function hasValidImageSignature(
  buffer: Buffer,
  mimeType: string
) {
  if (
    mimeType ===
    "image/jpeg"
  ) {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }


  if (
    mimeType ===
    "image/png"
  ) {
    const signature = [
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
    ];


    return (
      buffer.length >=
        signature.length &&
      signature.every(
        (
          byte,
          index
        ) =>
          buffer[index] ===
          byte
      )
    );
  }


  if (
    mimeType ===
    "image/webp"
  ) {
    return (
      buffer.length >= 12 &&
      buffer
        .subarray(
          0,
          4
        )
        .toString(
          "ascii"
        ) === "RIFF" &&
      buffer
        .subarray(
          8,
          12
        )
        .toString(
          "ascii"
        ) === "WEBP"
    );
  }


  return false;
}


function refreshProfilePaths() {
  revalidatePath(
    "/profil"
  );


  revalidatePath(
    "/dashboard"
  );
}


// ======================================================
// GET CURRENT AVATAR
// ======================================================

export async function GET() {
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


  const userId =
    String(
      session.id
    );


  const user =
    await prisma.user.findUnique({
      where: {
        id:
          userId,
      },

      select: {
        fotoProfil: true,
      },
    });


  if (!user) {
    return NextResponse.json(
      {
        error:
          "Pengguna tidak ditemukan.",
      },
      {
        status: 404,
      }
    );
  }


  return NextResponse.json(
    {
      fotoProfil:
        user.fotoProfil,
    },
    {
      headers: {
        "Cache-Control":
          "private, no-store, max-age=0",
      },
    }
  );
}


// ======================================================
// UPLOAD / GANTI AVATAR
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


  const userId =
    String(
      session.id
    );


  try {
    const formData =
      await request.formData();


    const fileValue =
      formData.get(
        "file"
      );


    if (
      !(fileValue instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "File foto belum dipilih.",
        },
        {
          status: 400,
        }
      );
    }


    const file =
      fileValue;


    if (
      file.size <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "File foto kosong.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      file.size >
      MAX_AVATAR_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Ukuran foto maksimal 2 MB.",
        },
        {
          status: 413,
        }
      );
    }


    if (
      !ALLOWED_MIME_TYPES.has(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Format foto harus JPG, PNG, atau WEBP.",
        },
        {
          status: 415,
        }
      );
    }


    const extension =
      getExtension(
        file.type
      );


    if (!extension) {
      return NextResponse.json(
        {
          error:
            "Format foto tidak didukung.",
        },
        {
          status: 415,
        }
      );
    }


    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );


    /*
     * Jangan hanya percaya MIME dari browser.
     * Signature dasar file juga diverifikasi.
     */
    if (
      !hasValidImageSignature(
        buffer,
        file.type
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Isi file tidak sesuai dengan format gambar.",
        },
        {
          status: 415,
        }
      );
    }


    const currentUser =
      await prisma.user.findUnique({
        where: {
          id:
            userId,
        },

        select: {
          id: true,
          fotoProfil: true,
          fotoProfilPath: true,
        },
      });


    if (!currentUser) {
      return NextResponse.json(
        {
          error:
            "Pengguna tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }


    const newPath =
      `${userId}/avatar-${Date.now()}-${randomUUID()}.${extension}`;


    const supabase =
      getSupabaseAdmin();


    const bucket =
      getAvatarBucket();


    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(
          bucket
        )
        .upload(
          newPath,
          buffer,
          {
            contentType:
              file.type,

            cacheControl:
              "3600",

            upsert:
              false,
          }
        );


    if (uploadError) {
      console.error(
        "Supabase avatar upload:",
        uploadError
      );


      return NextResponse.json(
        {
          error:
            "Foto gagal diunggah ke storage.",
        },
        {
          status: 502,
        }
      );
    }


    const publicUrl =
      getPublicAvatarUrl(
        newPath
      );


    try {
      await prisma.$transaction(
        async (
          tx
        ) => {
          await tx.user.update({
            where: {
              id:
                userId,
            },

            data: {
              fotoProfil:
                publicUrl,

              fotoProfilPath:
                newPath,
            },
          });


          await tx.auditLog.create({
            data: {
              userId,

              modul:
                "PENGGUNA",

              dataId:
                userId,

              aktivitas:
                currentUser.fotoProfil
                  ? "Mengganti foto profil"
                  : "Mengunggah foto profil",
            },
          });
        }
      );

    } catch (
      databaseError
    ) {
      /*
       * DB gagal setelah upload:
       * hapus file baru agar tidak menjadi orphan.
       */
      await supabase.storage
        .from(
          bucket
        )
        .remove([
          newPath,
        ])
        .catch(() => {
          // best effort cleanup
        });


      throw databaseError;
    }


    /*
     * DB sudah menunjuk file baru.
     * File lama sekarang aman untuk dibersihkan.
     */
    if (
      currentUser
        .fotoProfilPath &&
      currentUser
        .fotoProfilPath !==
        newPath
    ) {
      const {
        error:
          removeOldError,
      } =
        await supabase.storage
          .from(
            bucket
          )
          .remove([
            currentUser
              .fotoProfilPath,
          ]);


      if (
        removeOldError
      ) {
        console.warn(
          "Avatar lama gagal dibersihkan:",
          removeOldError
        );
      }
    }


    refreshProfilePaths();


    return NextResponse.json({
      success:
        true,

      fotoProfil:
        publicUrl,
    });

  } catch (error) {
    console.error(
      "Profile avatar upload error:",
      error
    );


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload foto profil gagal.",
      },
      {
        status: 500,
      }
    );
  }
}


// ======================================================
// DELETE AVATAR
// ======================================================

export async function DELETE() {
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


  const userId =
    String(
      session.id
    );


  try {
    const currentUser =
      await prisma.user.findUnique({
        where: {
          id:
            userId,
        },

        select: {
          fotoProfil: true,
          fotoProfilPath: true,
        },
      });


    if (!currentUser) {
      return NextResponse.json(
        {
          error:
            "Pengguna tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }


    if (
      !currentUser
        .fotoProfil &&
      !currentUser
        .fotoProfilPath
    ) {
      return NextResponse.json({
        success:
          true,

        fotoProfil:
          null,
      });
    }


    await prisma.$transaction(
      async (
        tx
      ) => {
        await tx.user.update({
          where: {
            id:
              userId,
          },

          data: {
            fotoProfil:
              null,

            fotoProfilPath:
              null,
          },
        });


        await tx.auditLog.create({
          data: {
            userId,

            modul:
              "PENGGUNA",

            dataId:
              userId,

            aktivitas:
              "Menghapus foto profil",
          },
        });
      }
    );


    if (
      currentUser
        .fotoProfilPath
    ) {
      const supabase =
        getSupabaseAdmin();


      const {
        error:
          removeError,
      } =
        await supabase.storage
          .from(
            getAvatarBucket()
          )
          .remove([
            currentUser
              .fotoProfilPath,
          ]);


      if (
        removeError
      ) {
        console.warn(
          "Avatar storage gagal dihapus:",
          removeError
        );
      }
    }


    refreshProfilePaths();


    return NextResponse.json({
      success:
        true,

      fotoProfil:
        null,
    });

  } catch (error) {
    console.error(
      "Profile avatar delete error:",
      error
    );


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Foto profil gagal dihapus.",
      },
      {
        status: 500,
      }
    );
  }
}
