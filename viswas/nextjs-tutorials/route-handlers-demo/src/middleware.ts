// redirect from profile to homepage

import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   return NextResponse.redirect(new URL("/", request.url));
// }
//
// // this tells to only apply to profile route
// export const config = {
//   matcher: "/profile",
// };

// Here we will use conditional logic

// export function middleware(request: NextRequest) {
//   if (request.nextUrl.pathname === "/profile") {
//     // this will change the url to the redirect url
//     // return NextResponse.redirect(new URL("/hello", request.nextUrl));
//
//     // if we want to rewrite the url to something else regardless of the page
//     // this will take us to /hello but leave the url as /profile
//     return NextResponse.rewrite(new URL("/hello", request.nextUrl));
//   }
// }

// how to use cookies and such

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const themePreference = request.cookies.get("theme");

  console.log({ themePreference });

  if (!themePreference) {
    response.cookies.set("theme", "dark");
  }

  response.headers.set("custom-header", "custom-value");

  return response;
}
