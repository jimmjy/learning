import { ProductDetail } from "@/app/products-db/product-detail";
import { getProducts } from "@/prisma-db";

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string | null;
};

export default async function ProductsDBPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const products: Product[] = await getProducts(query);

  return <ProductDetail products={products} />;
}
//   const products: Product[] = await getProducts();
//
//   const [optimisiticProducts, setOptimisticProducts] = useOptimistic(
//     products,
//     (currentProducts, prodcutId) => {
//       currentProducts.filter((product) => product.id !== prodcutId);
//     },
//   );
//
//   const removeProductById = async (productId: number) => {
//     setOptimisticProducts(productId);
//     await removeProduct(productId);
//   };
//
//   return (
//     <ul className="space-y-4 p-4">
//       {optimisiticProducts.map((product) => (
//         <li
//           key={product.id}
//           className="p-4 bg-white shadow-md rounded-lg text-gray-700"
//         >
//           <h2 className="text-xl font-semibold">
//             <Link href={`/products-db/${product.id}`}>{product.title}</Link>
//           </h2>
//           <p>{product.description}</p>
//           <p className="text-lg font-medium">${product.price}</p>
//           <form action={removeProductById.bind(null, product.id)}>
//             <button
//               type="submit"
//               className="px-4 py-2 mt-4 text-white bg-red-500 hover:bg-red-700 rounded-md"
//             >
//               Delete
//             </button>
//           </form>
//         </li>
//       ))}
//     </ul>
//   );
// }
