type ProductReviewProps = {
  params: Promise<{ productId: string }>;
};
export default async function ProductReview({ params }: ProductReviewProps) {
  const { productId } = await params;
  return <h1>Review page for product {productId}</h1>;
}
