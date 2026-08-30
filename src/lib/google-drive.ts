import { google } from "googleapis";


const GOOGLE_DRIVE_SCOPE =
  "https://www.googleapis.com/auth/drive.file";


// ======================================================
// REQUIRED ENV
// ======================================================

function getRequiredEnv(
  name: string
) {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `${name} belum dikonfigurasi.`
    );
  }

  return value;
}


// ======================================================
// OAUTH CLIENT
// ======================================================

export function createGoogleOAuthClient() {
  const clientId =
    getRequiredEnv(
      "GOOGLE_CLIENT_ID"
    );

  const clientSecret =
    getRequiredEnv(
      "GOOGLE_CLIENT_SECRET"
    );

  const redirectUri =
    getRequiredEnv(
      "GOOGLE_REDIRECT_URI"
    );


  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
}


// ======================================================
// AUTH URL
// ======================================================

export function createGoogleAuthUrl(
  state: string
) {
  const oauth2Client =
    createGoogleOAuthClient();


  return oauth2Client.generateAuthUrl({
    access_type: "offline",

    prompt: "consent",

    include_granted_scopes:
      true,

    scope: [
      GOOGLE_DRIVE_SCOPE,
    ],

    state,
  });
}


// ======================================================
// AUTHORIZED OAUTH CLIENT
// ======================================================

export function createGoogleAuthorizedClient() {
  const refreshToken =
    getRequiredEnv(
      "GOOGLE_REFRESH_TOKEN"
    );


  const oauth2Client =
    createGoogleOAuthClient();


  oauth2Client.setCredentials({
    refresh_token:
      refreshToken,
  });


  return oauth2Client;
}


// ======================================================
// ACCESS TOKEN
// ======================================================

export async function getGoogleAccessToken() {
  const oauth2Client =
    createGoogleAuthorizedClient();


  const result =
    await oauth2Client.getAccessToken();


  const token =
    typeof result === "string"
      ? result
      : result?.token;


  if (!token) {
    throw new Error(
      "Google access token tidak tersedia."
    );
  }


  return token;
}


// ======================================================
// DRIVE CLIENT
// ======================================================

export function createGoogleDriveClient() {
  const oauth2Client =
    createGoogleAuthorizedClient();


  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}


// ======================================================
// ROOT FOLDER
// ======================================================

export function getGoogleDriveRootFolderId() {
  return getRequiredEnv(
    "GOOGLE_DRIVE_ROOT_FOLDER_ID"
  );
}