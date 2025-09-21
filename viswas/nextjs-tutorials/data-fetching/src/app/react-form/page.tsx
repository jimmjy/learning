"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateProduct() {
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  // const [loading, setLoading] = useState<boolean>(false);
  console.log(title, price, description);

  const router = useRouter();

  console.log(router);

  return (
    <form className="p-4 space-y-4 max-w-96">
      <label>
        Title
        <input
          className="block w-full p-2 text-black border rounded"
          type="text"
          name="title"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        Price
        <input
          className="block w-full p-2 text-black border rounded"
          type="text"
          name="price"
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>
      <label>
        description
        <textarea
          className="block w-full p-2 text-black border rounded"
          name="description"
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
