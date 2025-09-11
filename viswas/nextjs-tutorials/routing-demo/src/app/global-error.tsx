/**
 * So far this is working without html body tags but might need them

   this file should be really simple to prevent errors in here
 */
"use client";

import "./global.css";

export default function GlobalError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          // refresh the page
          window.location.reload();
        }}
      >
        Refresh
      </button>
    </div>
  );
}
