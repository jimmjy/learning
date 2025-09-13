"use client";

import { Suspense } from "react";

export default function ClientWithChild({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("client with child");
  return (
    <div>
      <h1>I am showing an async child server</h1>
      <Suspense fallback={<p>Loading from the client ...</p>}>
        {children}
      </Suspense>
    </div>
  );
}
