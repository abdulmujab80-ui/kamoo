import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";


let supabaseAdmin:
  SupabaseClient | null = null;


// ======================================================
// ENV
// ======================================================

function getRequiredEnv(
  name: string
) {
  const value =
    process.env[
      name
    ]?.trim();


  if (!value) {
    throw new Error(
      `${name} belum dikonfigurasi.`
    );
  }


  return value;
}


// ======================================================
// SUPABASE ADMIN CLIENT
// SERVER ONLY
// ======================================================

export function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }


  const supabaseUrl =
    getRequiredEnv(
      "SUPABASE_URL"
    );


  const secretKey =
    process.env
      .SUPABASE_SECRET_KEY
      ?.trim() ||
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();


  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY belum dikonfigurasi."
    );
  }


  supabaseAdmin =
    createClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          autoRefreshToken:
            false,

          persistSession:
            false,
        },
      }
    );


  return supabaseAdmin;
}


// ======================================================
// AVATAR BUCKET
// ======================================================

export function getAvatarBucket() {
  return (
    process.env
      .SUPABASE_AVATAR_BUCKET
      ?.trim() ||
    "avatars"
  );
}


// ======================================================
// PUBLIC AVATAR URL
// Bucket avatars harus PUBLIC.
// ======================================================

export function getPublicAvatarUrl(
  path: string
) {
  const supabase =
    getSupabaseAdmin();


  const {
    data,
  } =
    supabase.storage
      .from(
        getAvatarBucket()
      )
      .getPublicUrl(
        path
      );


  return data.publicUrl;
}
