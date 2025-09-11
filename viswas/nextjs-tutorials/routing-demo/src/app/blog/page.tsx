import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Blog",
  },
};

export default async function Blog() {
  await new Promise((r) => {
    setTimeout(() => {
      r("test");
    }, 2000);
  });
  return <h1>My Blog</h1>;
}
