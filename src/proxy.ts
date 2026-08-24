import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function proxy(
  request: NextRequest
){

  const token = request.cookies.get(
    "session"
  )?.value;


  const pathname = request.nextUrl.pathname;


  if(
    pathname.startsWith("/dashboard") &&
    !token
  ){

    return NextResponse.redirect(
      new URL("/login", request.url)
    );

  }


  return NextResponse.next();

}



export const config = {

matcher:[
"/dashboard/:path*"
]

};