type DocsProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function Docs({ params }: DocsProps) {
  const { slug } = await params;

  if (slug?.length === 2) {
    return (
      <h1>Viewing docs for feature {slug[0]} and concept catch-all-segments</h1>
    );
  } else if (slug?.length === 1) {
    return <h1>Viewing docs for feature {slug[0]}</h1>;
  }

  return <h1>Docs home page {slug}</h1>;
}
