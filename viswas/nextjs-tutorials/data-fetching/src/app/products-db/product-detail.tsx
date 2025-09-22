"use client";

import { removeProduct } from "@/actions/products";
import Form from "next/form";
import Link from "next/link";
import { useOptimistic } from "react";

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string | null;
};

export const ProductDetail = ({ products }: { products: Product[] }) => {
  const [optimisiticProducts, setOptimisticProducts] = useOptimistic(
    products, // the state, so without this we would be mapping the products below
    // A call back that takes the current state (products) and whatever value we call setOptimisticProducts with,
    // the productId in the async below and returns the result we evalutate to in the body below
    // it must be a pure function
    (currentProducts, prodcutId) => {
      return currentProducts.filter((product) => product.id !== prodcutId);
    },
  );

  const removeProductById = async (productId: number) => {
    setOptimisticProducts(productId);
    await removeProduct(productId);
  };

  return (
    <ul className="space-y-4 p-4">
      {optimisiticProducts.map((product) => (
        <li
          key={product.id}
          className="p-4 bg-white shadow-md rounded-lg text-gray-700"
        >
          <h2 className="text-xl font-semibold">
            <Link href={`/products-db/${product.id}`}>{product.title}</Link>
          </h2>
          <p>{product.description}</p>
          <p className="text-lg font-medium">${product.price}</p>
          <Form action={removeProductById.bind(null, product.id)}>
            <button
              type="submit"
              className="px-4 py-2 mt-4 text-white bg-red-500 hover:bg-red-700 rounded-md"
            >
              Delete
            </button>
          </Form>
        </li>
      ))}
    </ul>
  );
};
