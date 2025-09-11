import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// this is using traditional request object to get headers
/*
export async function GET(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  console.log({ request, requestHeaders });
  return Response.json({ data: "Users data" });
}
*/

// this is the more nextjs way using headers function

export async function GET(request: NextRequest) {
  // const headersList = await headers(); // need to await it
  //
  // console.log(headersList.get("Authorization"));

  // console.log(request);

  // standard cookies from request
  const theme = request.cookies.get("theme");
  console.log("Theme cookie:", theme);

  // nextjs cookies function
  const cookieStore = await cookies();
  console.log(cookieStore.get("theme"));

  // add headers to response, without this response is text/plain
  return new Response("Profile API data", {
    headers: {
      "Content-Type": "text/html",
      "Set-Cookie": "theme=dark",
    },
  });
}
