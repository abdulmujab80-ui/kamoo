"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

import {
  createGoogleDriveClient,
} from "@/lib/google-drive";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";


type LokerPermissionValue =
  | "VIEWER"
  | "EDITOR";


// ======================================================
// SESSION
// ======================================================

async function requireSession() {
  const session =
    await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}


// ======================================================
// VALIDATE NAME
// ======================================================

function validateName(
  nama: string,
  maxLength = 100
) {
  const cleanName =
    nama.trim();

  if (!cleanName) {
    throw new Error(
      "Nama wajib diisi."
    );
  }

  if (
    cleanName.length >
    maxLength
  ) {
    throw new Error(
      `Nama maksimal ${maxLength} karakter.`
    );
  }

  return cleanName;
}


// ======================================================
// VALIDATE PERMISSION
// ======================================================

function validatePermission(
  permission: string
): LokerPermissionValue {
  if (
    permission !==
      "VIEWER" &&
    permission !==
      "EDITOR"
  ) {
    throw new Error(
      "Permission Loker tidak valid."
    );
  }

  return permission;
}


// ======================================================
// ACCESS
// ======================================================

async function getLokerAccess(
  lokerId: string,
  userId: string
) {
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
          },

          select: {
            permission:
              true,
          },

          take:
            1,
        },
      },
    });


  if (!loker) {
    throw new Error(
      "Loker tidak ditemukan."
    );
  }


  if (
    loker.userId ===
    userId
  ) {
    return {
      loker,
      permission:
        "OWNER" as const,
    };
  }


  const share =
    loker.shares[0];


  if (!share) {
    throw new Error(
      "Anda tidak memiliki akses ke Loker ini."
    );
  }


  return {
    loker,
    permission:
      share.permission,
  };
}


async function requireLokerEditor(
  lokerId: string,
  userId: string
) {
  const access =
    await getLokerAccess(
      lokerId,
      userId
    );


  if (
    access.permission !==
      "OWNER" &&
    access.permission !==
      "EDITOR"
  ) {
    throw new Error(
      "Akses Anda hanya VIEWER."
    );
  }


  return access.loker;
}


async function requireLokerOwner(
  lokerId: string,
  userId: string
) {
  const loker =
    await prisma.loker.findUnique({
      where: {
        id:
          lokerId,
      },

      select: {
        id: true,
        userId: true,
      },
    });


  if (
    !loker ||
    loker.userId !==
      userId
  ) {
    throw new Error(
      "Hanya pemilik Loker yang dapat mengatur akses."
    );
  }


  return loker;
}


// ======================================================
// REVALIDATE
// ======================================================

function revalidateLoker(
  folderId?: string | null,
  lokerId?: string | null
) {
  revalidatePath(
    "/loker"
  );


  if (folderId) {
    revalidatePath(
      `/loker/${folderId}`
    );
  }


  if (lokerId) {
    revalidatePath(
      `/loker/shared/${lokerId}`
    );
  }
}


// ======================================================
// GOOGLE 404
// ======================================================

function isGoogleNotFound(
  error: unknown
) {
  if (
    typeof error !==
      "object" ||
    error === null
  ) {
    return false;
  }


  const googleError =
    error as {
      code?: unknown;

      response?: {
        status?: unknown;
      };
    };


  return (
    googleError.code ===
      404 ||
    googleError.response
      ?.status ===
      404
  );
}


// ======================================================
// CREATE FOLDER
// OWNER / EDITOR
// ======================================================

export async function buatFolder(
  lokerId: string,
  nama: string,
  parentId?: string | null
) {
  const session =
    await requireSession();


  const userId =
    String(
      session.id
    );


  const cleanName =
    validateName(
      nama
    );


  await requireLokerEditor(
    lokerId,
    userId
  );


  if (parentId) {
    const parent =
      await prisma.lokerFolder.findUnique({
        where: {
          id:
            parentId,
        },

        select: {
          id: true,
          lokerId: true,
        },
      });


    if (
      !parent ||
      parent.lokerId !==
        lokerId
    ) {
      throw new Error(
        "Folder induk tidak valid."
      );
    }
  }


  const existing =
    await prisma.lokerFolder.findFirst({
      where: {
        lokerId,

        parentId:
          parentId ??
          null,

        nama:
          cleanName,
      },

      select: {
        id: true,
      },
    });


  if (existing) {
    throw new Error(
      "Folder dengan nama tersebut sudah ada."
    );
  }


  const folder =
    await prisma.lokerFolder.create({
      data: {
        lokerId,

        parentId:
          parentId ??
          null,

        nama:
          cleanName,
      },
    });


  await prisma.auditLog.create({
    data: {
      userId,

      modul:
        "LOKER",

      dataId:
        lokerId,

      aktivitas:
        `Membuat folder Loker "${cleanName}"`,
    },
  });


  revalidateLoker(
    parentId,
    lokerId
  );


  return folder.id;
}


// ======================================================
// RENAME FOLDER
// OWNER / EDITOR
// ======================================================

export async function renameFolder(
  folderId: string,
  nama: string
) {
  const session =
    await requireSession();


  const userId =
    String(
      session.id
    );


  const cleanName =
    validateName(
      nama
    );


  const folder =
    await prisma.lokerFolder.findUnique({
      where: {
        id:
          folderId,
      },

      select: {
        id: true,
        nama: true,
        parentId: true,
        lokerId: true,
      },
    });


  if (!folder) {
    throw new Error(
      "Folder tidak ditemukan."
    );
  }


  await requireLokerEditor(
    folder.lokerId,
    userId
  );


  if (
    folder.nama ===
    cleanName
  ) {
    return;
  }


  const existing =
    await prisma.lokerFolder.findFirst({
      where: {
        lokerId:
          folder.lokerId,

        parentId:
          folder.parentId ??
          null,

        nama:
          cleanName,

        NOT: {
          id:
            folder.id,
        },
      },

      select: {
        id: true,
      },
    });


  if (existing) {
    throw new Error(
      "Folder dengan nama tersebut sudah ada."
    );
  }


  await prisma.$transaction([
    prisma.lokerFolder.update({
      where: {
        id:
          folder.id,
      },

      data: {
        nama:
          cleanName,
      },
    }),

    prisma.auditLog.create({
      data: {
        userId,

        modul:
          "LOKER",

        dataId:
          folder.lokerId,

        aktivitas:
          `Mengubah nama folder Loker "${folder.nama}" menjadi "${cleanName}"`,
      },
    }),
  ]);


  revalidateLoker(
    folder.parentId,
    folder.lokerId
  );

  revalidatePath(
    `/loker/${folder.id}`
  );
}


// ======================================================
// DELETE FOLDER
// OWNER / EDITOR
// ======================================================

export async function hapusFolder(
  folderId: string
) {
  const session =
    await requireSession();


  const userId =
    String(
      session.id
    );


  const folder =
    await prisma.lokerFolder.findUnique({
      where: {
        id:
          folderId,
      },

      select: {
        id: true,
        nama: true,
        parentId: true,
        lokerId: true,

        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
    });


  if (!folder) {
    throw new Error(
      "Folder tidak ditemukan."
    );
  }


  await requireLokerEditor(
    folder.lokerId,
    userId
  );


  if (
    folder._count.files >
      0 ||
    folder._count.children >
      0
  ) {
    throw new Error(
      "Folder harus kosong sebelum dihapus."
    );
  }


  await prisma.$transaction([
    prisma.lokerFolder.delete({
      where: {
        id:
          folder.id,
      },
    }),

    prisma.auditLog.create({
      data: {
        userId,

        modul:
          "LOKER",

        dataId:
          folder.lokerId,

        aktivitas:
          `Menghapus folder Loker "${folder.nama}"`,
      },
    }),
  ]);


  revalidateLoker(
    folder.parentId,
    folder.lokerId
  );


  return {
    parentId:
      folder.parentId,
  };
}


// ======================================================
// RENAME FILE
// OWNER / EDITOR
// Google Drive -> Database
// ======================================================

export async function renameFile(
  fileId: string,
  nama: string
) {
  const session =
    await requireSession();


  const userId =
    String(
      session.id
    );


  const cleanName =
    validateName(
      nama,
      255
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
        lokerId: true,
        folderId: true,
        storageId: true,
      },
    });


  if (!file) {
    throw new Error(
      "File tidak ditemukan."
    );
  }


  await requireLokerEditor(
    file.lokerId,
    userId
  );


  if (
    file.nama ===
    cleanName
  ) {
    return;
  }


  const existing =
    await prisma.lokerFile.findFirst({
      where: {
        lokerId:
          file.lokerId,

        folderId:
          file.folderId ??
          null,

        nama:
          cleanName,

        NOT: {
          id:
            file.id,
        },
      },

      select: {
        id: true,
      },
    });


  if (existing) {
    throw new Error(
      "File dengan nama tersebut sudah ada."
    );
  }


  const drive =
    createGoogleDriveClient();


  let googleRenamed =
    false;


  try {
    await drive.files.update({
      fileId:
        file.storageId,

      requestBody: {
        name:
          cleanName,
      },
    });


    googleRenamed =
      true;


    await prisma.$transaction([
      prisma.lokerFile.update({
        where: {
          id:
            file.id,
        },

        data: {
          nama:
            cleanName,
        },
      }),

      prisma.auditLog.create({
        data: {
          userId,

          modul:
            "LOKER",

          dataId:
            file.lokerId,

          aktivitas:
            `Mengubah nama file Loker "${file.nama}" menjadi "${cleanName}"`,
        },
      }),
    ]);

  } catch (error) {

    if (
      googleRenamed
    ) {
      try {
        await drive.files.update({
          fileId:
            file.storageId,

          requestBody: {
            name:
              file.nama,
          },
        });
      } catch (
        rollbackError
      ) {
        console.error(
          "Google Drive rename rollback gagal:",
          rollbackError
        );
      }
    }


    console.error(
      "Rename file Loker gagal:",
      error
    );


    throw new Error(
      "Gagal mengubah nama file."
    );
  }


  revalidateLoker(
    file.folderId,
    file.lokerId
  );
}


// ======================================================
// DELETE FILE
// OWNER / EDITOR
// Google Drive -> Database
// ======================================================

export async function hapusFile(
  fileId: string
) {
  const session =
    await requireSession();


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
        folderId: true,
        lokerId: true,
        storageId: true,
      },
    });


  if (!file) {
    throw new Error(
      "File tidak ditemukan."
    );
  }


  await requireLokerEditor(
    file.lokerId,
    userId
  );


  const drive =
    createGoogleDriveClient();


  try {
    await drive.files.delete({
      fileId:
        file.storageId,
    });

  } catch (error) {

    if (
      !isGoogleNotFound(
        error
      )
    ) {
      console.error(
        "Google Drive delete gagal:",
        error
      );

      throw new Error(
        "Google Drive gagal menghapus file."
      );
    }
  }


  try {
    await prisma.$transaction([
      prisma.lokerFile.delete({
        where: {
          id:
            file.id,
        },
      }),

      prisma.auditLog.create({
        data: {
          userId,

          modul:
            "LOKER",

          dataId:
            file.lokerId,

          aktivitas:
            `Menghapus file Loker "${file.nama}"`,
        },
      }),
    ]);

  } catch (error) {
    console.error(
      "Database delete file gagal:",
      error
    );

    throw new Error(
      "File sudah dihapus dari Google Drive, tetapi metadata KAMOO gagal dibersihkan."
    );
  }


  revalidateLoker(
    file.folderId,
    file.lokerId
  );
}


// ======================================================
// SHARE LOKER
// OWNER ONLY
// ======================================================

export async function bagikanLoker(
  lokerId: string,
  targetUserId: string,
  permissionInput: string
) {
  const session =
    await requireSession();


  const ownerId =
    String(
      session.id
    );


  const permission =
    validatePermission(
      permissionInput
    );


  await requireLokerOwner(
    lokerId,
    ownerId
  );


  if (
    targetUserId ===
    ownerId
  ) {
    throw new Error(
      "Loker tidak dapat dibagikan kepada pemiliknya sendiri."
    );
  }


  const targetUser =
    await prisma.user.findUnique({
      where: {
        id:
          targetUserId,
      },

      select: {
        id: true,
        nama: true,
        aktif: true,
      },
    });


  if (
    !targetUser ||
    !targetUser.aktif
  ) {
    throw new Error(
      "Pengguna tujuan tidak ditemukan atau tidak aktif."
    );
  }


  const existing =
    await prisma.lokerShare.findFirst({
      where: {
        lokerId,
        userId:
          targetUserId,
      },

      select: {
        id: true,
      },
    });


  if (existing) {
    await prisma.lokerShare.update({
      where: {
        id:
          existing.id,
      },

      data: {
        permission,
      },
    });

  } else {
    await prisma.lokerShare.create({
      data: {
        lokerId,

        userId:
          targetUserId,

        permission,
      },
    });
  }


  await prisma.auditLog.create({
    data: {
      userId:
        ownerId,

      modul:
        "LOKER",

      dataId:
        lokerId,

      aktivitas:
        `Membagikan Loker kepada "${targetUser.nama}" sebagai ${permission}`,
    },
  });


  revalidatePath(
    "/loker"
  );

  revalidatePath(
    `/loker/shared/${lokerId}`
  );
}


// ======================================================
// UPDATE SHARE
// OWNER ONLY
// ======================================================

export async function ubahAksesLoker(
  shareId: string,
  permissionInput: string
) {
  const session =
    await requireSession();


  const ownerId =
    String(
      session.id
    );


  const permission =
    validatePermission(
      permissionInput
    );


  const share =
    await prisma.lokerShare.findUnique({
      where: {
        id:
          shareId,
      },

      include: {
        loker: {
          select: {
            id: true,
            userId: true,
          },
        },

        user: {
          select: {
            nama: true,
          },
        },
      },
    });


  if (!share) {
    throw new Error(
      "Akses Loker tidak ditemukan."
    );
  }


  if (
    share.loker.userId !==
    ownerId
  ) {
    throw new Error(
      "Hanya pemilik Loker yang dapat mengubah akses."
    );
  }


  if (
    share.permission ===
    permission
  ) {
    return;
  }


  await prisma.$transaction([
    prisma.lokerShare.update({
      where: {
        id:
          share.id,
      },

      data: {
        permission,
      },
    }),

    prisma.auditLog.create({
      data: {
        userId:
          ownerId,

        modul:
          "LOKER",

        dataId:
          share.loker.id,

        aktivitas:
          `Mengubah akses Loker "${share.user.nama}" menjadi ${permission}`,
      },
    }),
  ]);


  revalidatePath(
    "/loker"
  );

  revalidatePath(
    `/loker/shared/${share.loker.id}`
  );
}


// ======================================================
// REMOVE SHARE
// OWNER ONLY
// ======================================================

export async function hapusAksesLoker(
  shareId: string
) {
  const session =
    await requireSession();


  const ownerId =
    String(
      session.id
    );


  const share =
    await prisma.lokerShare.findUnique({
      where: {
        id:
          shareId,
      },

      include: {
        loker: {
          select: {
            id: true,
            userId: true,
          },
        },

        user: {
          select: {
            nama: true,
          },
        },
      },
    });


  if (!share) {
    throw new Error(
      "Akses Loker tidak ditemukan."
    );
  }


  if (
    share.loker.userId !==
    ownerId
  ) {
    throw new Error(
      "Hanya pemilik Loker yang dapat mencabut akses."
    );
  }


  await prisma.$transaction([
    prisma.lokerShare.delete({
      where: {
        id:
          share.id,
      },
    }),

    prisma.auditLog.create({
      data: {
        userId:
          ownerId,

        modul:
          "LOKER",

        dataId:
          share.loker.id,

        aktivitas:
          `Mencabut akses Loker dari "${share.user.nama}"`,
      },
    }),
  ]);


  revalidatePath(
    "/loker"
  );

  revalidatePath(
    `/loker/shared/${share.loker.id}`
  );
}
