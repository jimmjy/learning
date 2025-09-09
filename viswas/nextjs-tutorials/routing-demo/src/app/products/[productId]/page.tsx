import { Metadata } from "next";

type ProductDetailsProps = {
  params: Promise<{ productId: string }>;
};

export const generateMetadata = async ({
  params,
}: ProductDetailsProps): Promise<Metadata> => {
  const id = (await params).productId;
  return {
    title: `Product ${id}`,
  };
};

export default async function ProductDetails(props: ProductDetailsProps) {
  const { productId } = await props.params;

  return <h1>Details about product {productId}</h1>;
}
