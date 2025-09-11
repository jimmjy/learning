"use client";

import "./global.css";

import { useState } from "react";

interface WrapperProps {
  children: React.ReactNode;
}

function ErrorSimulator({
  message = "An error occurred",
}: {
  message?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    throw new Error(message);
  }

  return (
    <button
      title="Simulate an error"
      className="bg-red-950 text-red-500 rounded p-1 leading-none font-semibold text-sm"
      onClick={() => setError(true)}
    >
      Simulate Error
    </button>
  );
}

export default function ErrorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* <div> */}
      {/*   <ErrorSimulator message="Simulated error in root layout" /> */}
      {/* </div> */}
      {children}
    </div>
  );
}
