import ClientWithChild from "@/components/client-with-child";
import { Reviews } from "@/components/reviews";
import { cookies } from "next/headers";

export default async function About() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");

  console.log(theme);
  console.log("About server component");

  return (
    <>
      <h1>About page {new Date().toLocaleTimeString()}</h1>
      <ClientWithChild>
        <Reviews />
      </ClientWithChild>
    </>
  );
}
