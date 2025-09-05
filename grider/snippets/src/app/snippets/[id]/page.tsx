import { db } from '@/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SnippetShowProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SnippetShowPage(props: SnippetShowProps) {
  // random fake delay to see loading component
  await new Promise((r) => setTimeout(r, 2000));

  // get id from params
  const { id } = await props.params;

  // using id get snippet from database
  const snippet = await db.snippet.findFirst({
    where: { id: parseInt(id) },
  });

  // if no snippet, send to a not found page
  if (!snippet) {
    notFound();
  }

  return (
    <div>
      <div className="flex m-4 justify-between items-center">
        <h1 className="text-xl font-bold">{snippet.title}</h1>
        <div className="flex gap-4">
          <Link className="p-2 border rounded" href={`/snippets/${id}/edit`}>
            Edit
          </Link>
          <button className="p-2 border rounded">Delete</button>
        </div>
      </div>
      <pre className="p-3 border rounded bg-gray-200 border-gray-200">
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}
