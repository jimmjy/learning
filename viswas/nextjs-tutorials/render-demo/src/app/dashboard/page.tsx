"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [name, setName] = useState("");

  return (
    <div>
      <h1>Dashboard</h1>
      <input
        className="border-2 m-1 p-2"
        value={name}
        placeholder="testing"
        onChange={(e) => setName(e.target.value)}
      />
      <p>Hello, {name}!</p>
    </div>
  );
}
