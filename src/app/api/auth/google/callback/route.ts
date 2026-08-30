import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";

import { getSession } from "@/lib/auth";
import { createGoogleOAuthClient } from "@/lib/google-drive";


// ======================================================
// GOOGLE OAUTH CALLBACK
// ======================================================

export async function GET(
  request: Request
) {
  const session =
    await getSession();


  if (!session) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );
  }


  if (
    session.role !==
    "SUPERADMIN"
  ) {
    return new Response(
      "Forbidden",
      {
        status: 403,
      }
    );
  }


  const url =
    new URL(
      request.url
    );


  const code =
    url.searchParams.get(
      "code"
    );


  const returnedState =
    url.searchParams.get(
      "state"
    );


  const oauthError =
    url.searchParams.get(
      "error"
    );


  if (oauthError) {
    return new Response(
      `Google OAuth gagal: ${oauthError}`,
      {
        status: 400,
      }
    );
  }


  if (!code) {
    return new Response(
      "Authorization code Google tidak ditemukan.",
      {
        status: 400,
      }
    );
  }


  const cookieStore =
    await cookies();


  const savedState =
    cookieStore
      .get(
        "google_oauth_state"
      )
      ?.value;


  if (
    !savedState ||
    !returnedState ||
    savedState !==
      returnedState
  ) {
    return new Response(
      "OAuth state tidak valid.",
      {
        status: 400,
      }
    );
  }


  // State hanya boleh
  // digunakan sekali.

  cookieStore.delete(
    "google_oauth_state"
  );


  try {

    // ==================================================
    // EXCHANGE CODE
    // ==================================================

    const oauth2Client =
      createGoogleOAuthClient();


    const {
      tokens,
    } =
      await oauth2Client.getToken(
        code
      );


    if (
      !tokens.refresh_token
    ) {
      return new Response(
        [
          "Google tidak memberikan refresh token.",
          "",
          "Coba ulangi koneksi OAuth menggunakan akun Test User.",
          "Pastikan access_type=offline dan prompt=consent aktif.",
        ].join("\n"),
        {
          status: 400,
          headers: {
            "Content-Type":
              "text/plain; charset=utf-8",
          },
        }
      );
    }


    oauth2Client.setCredentials(
      tokens
    );


    // ==================================================
    // GOOGLE DRIVE
    // ==================================================

    const drive =
      google.drive({
        version: "v3",
        auth: oauth2Client,
      });


    // ==================================================
    // BUAT ROOT STORAGE
    // ==================================================

    const rootFolder =
      await drive.files.create({
        requestBody: {
          name:
            "KAMOO STORAGE",

          mimeType:
            "application/vnd.google-apps.folder",
        },

        fields:
          "id,name,webViewLink",
      });


    const rootFolderId =
      rootFolder.data.id;


    if (!rootFolderId) {
      throw new Error(
        "Google Drive tidak mengembalikan Folder ID."
      );
    }


    // ==================================================
    // SETUP LOCAL DEVELOPMENT
    // ==================================================
    //
    // PENTING:
    // Nilai ini hanya dicetak pada terminal lokal.
    // Jangan kirim ke chat / GitHub.
    //
    // Setelah dicopy ke .env,
    // hapus console.log refresh token ini.
    // ==================================================

    console.log(
      "\n======================================"
    );

    console.log(
      "KAMOO GOOGLE DRIVE SETUP BERHASIL"
    );

    console.log(
      "======================================"
    );

    console.log(
      "GOOGLE_REFRESH_TOKEN="
    );

    console.log(
      "\nGOOGLE_DRIVE_ROOT_FOLDER_ID="
    );

    console.log(
      rootFolderId
    );

    console.log(
      "\n======================================\n"
    );


    // ==================================================
    // SUCCESS PAGE
    // ==================================================

    const html = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          <title>
            Google Drive Terhubung
          </title>
        </head>

        <body
          style="
            margin:0;
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f4fbfc;
            font-family:Arial,sans-serif;
            color:#0f172a;
            padding:24px;
            box-sizing:border-box;
          "
        >

          <main
            style="
              width:100%;
              max-width:520px;
              background:white;
              border:1px solid #e2e8f0;
              border-radius:24px;
              padding:32px;
              box-shadow:0 20px 50px rgba(15,23,42,.08);
            "
          >

            <div
              style="
                width:52px;
                height:52px;
                border-radius:16px;
                background:#ecfeff;
                color:#0891b2;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:26px;
              "
            >
              ✓
            </div>


            <h1
              style="
                margin:20px 0 8px;
                font-size:24px;
              "
            >
              Google Drive terhubung
            </h1>


            <p
              style="
                margin:0;
                color:#64748b;
                line-height:1.7;
              "
            >
              OAuth KAMOO berhasil dan root folder
              KAMOO STORAGE telah dibuat melalui
              Google Drive API.
            </p>


            <div
              style="
                margin-top:20px;
                padding:16px;
                border-radius:16px;
                background:#f8fafc;
                color:#475569;
                font-size:14px;
                line-height:1.6;
              "
            >
              Lihat terminal
              <strong>npm run dev</strong>
              untuk mengambil
              GOOGLE_REFRESH_TOKEN dan
              GOOGLE_DRIVE_ROOT_FOLDER_ID.
            </div>


            <p
              style="
                margin:18px 0 0;
                font-size:12px;
                color:#94a3b8;
                line-height:1.6;
              "
            >
              Jangan membagikan refresh token
              atau Client Secret kepada siapa pun.
            </p>

          </main>

        </body>
      </html>
    `;


    return new Response(
      html,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/html; charset=utf-8",
        },
      }
    );

  } catch (error) {

    console.error(
      "Google OAuth callback error:",
      error
    );


    return new Response(
      "Gagal menghubungkan Google Drive.",
      {
        status: 500,
      }
    );

  }
}