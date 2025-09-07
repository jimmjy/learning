type ProductDetailsProps = {
  params: Promise<{ productId: string }>;
};
export default async function ProductDetails(props: ProductDetailsProps) {
  const { productId } = await props.params;

  console.log(`Params from:`, productId);
  return <h1>Details about product {productId}</h1>;
}
