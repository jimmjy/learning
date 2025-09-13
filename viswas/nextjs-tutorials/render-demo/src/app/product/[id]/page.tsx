export const dynamicParams = false;

// this is basically pre creating pages for these 3 id so 3 pages are made at build time
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <h1>
      Product {id} details rendering at {new Date().toLocaleTimeString()}
    </h1>
  );
}
