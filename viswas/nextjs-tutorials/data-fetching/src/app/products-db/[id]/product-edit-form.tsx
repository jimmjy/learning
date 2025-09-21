"use client";

import { Submit } from "@/component/submit";
import { useActionState } from "react";
import { editProduct } from "@/actions/products";
import type { FormState } from "@/actions/products";
import type { Product } from "@/app/products-db/page";

export default function EditProductForm({ product }: { product: Product }) {
  const initialState: FormState = {
    errors: {},
  };

  const editWithProductId = editProduct.bind(null, product.id);

  const [state, formAction] = useActionState(editWithProductId, initialState);

  return (
    <form className="flex flex-col gap-4 p-4 max-w-96" action={formAction}>
      <div>
        <label className="text-white">
          Title
          <input
            className="block w-full p-2 text-black border rounded bg-white"
            type="text"
            name="title"
            defaultValue={product.title}
          />
        </label>
        {state.errors.title && (
          <p className="text-red-500">{state.errors.title}</p>
        )}
      </div>
      <div>
        <label className="text-white">
          Price
          <input
            className="block w-full p-2 text-black border rounded bg-white"
            type="text"
            name="price"
            defaultValue={product.price}
          />
        </label>
        {state.errors.price && (
          <p className="text-red-500">{state.errors.price}</p>
        )}
      </div>
      <div>
        <label className="text-white">
          description
          <textarea
            className="block w-full p-2 text-black border rounded bg-white"
            name="description"
            defaultValue={product.description ?? ""}
          />
        </label>
        {state.errors.description && (
          <p className="text-red-500">{state.errors.description}</p>
        )}
      </div>
      <Submit />
    </form>
  );
}
