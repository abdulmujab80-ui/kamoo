import {
  NextResponse,
} from "next/server";

import {
  cookies,
} from "next/headers";

import {
  randomUUID,
} from "node:crypto";

import {
  getSession,
} from "@/lib/auth";

import {
  createGoogleAuthUrl,
} from "@/lib/google-drive";


export async function GET() {
  const session =
    await getSession();


  if (!session) {
    return NextResponse.redirect(
      new URL(
        "/login",
        process.env.NEXT_PUBLIC_APP_URL ??
          "http://localhost:3000"
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


  const state =
    randomUUID();


  const cookieStore =
    await cookies();


  cookieStore.set(
    "google_oauth_state",
    state,
    {
      httpOnly: true,

      sameSite: "lax",

      secure:
        process.env.NODE_ENV ===
        "production",

      path: "/",

      maxAge: 60 * 10,
    }
  );


  const authorizationUrl =
    createGoogleAuthUrl(
      state
    );


  return NextResponse.redirect(
    authorizationUrl
  );
}