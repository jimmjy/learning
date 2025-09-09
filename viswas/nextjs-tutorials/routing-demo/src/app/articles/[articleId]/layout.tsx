"use client";

import { use } from "react";

export default function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = use(params);

  console.log({ articleId: decodeURIComponent(articleId) });
  return <div>{children}</div>;
}
