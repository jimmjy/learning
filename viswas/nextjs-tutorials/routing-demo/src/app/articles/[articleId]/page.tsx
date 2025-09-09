import Link from "next/link";

type NewsArticleProps = {
  params: Promise<{ articleId: string }>;
  searchParams: Promise<{ lang: string }>;
};

export default async function NewsArticle({
  params,
  searchParams,
}: NewsArticleProps) {
  const { articleId } = await params;
  const { lang } = await searchParams;

  return (
    <div>
      <h1>News article {articleId}</h1>
      <p>Reading in {lang}</p>

      <div>
        <Link href="/articles/{articleId}?lang=en">English</Link>
        <Link href="/articles/{articleId}?lang=es">Spanish</Link>
        <Link href="/articles/{articleId}?lang=fr">French</Link>
      </div>
    </div>
  );
}
