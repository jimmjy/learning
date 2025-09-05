import { db } from '@/db';
import { notFound } from 'next/navigation';

import { SnippetEditForm } from '@/components/snippet-edit-form';

interface SnippetEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SnippetEditPage(props: SnippetEditPageProps) {
  console.log({ props });
  const params = await props.params;
  const id = parseInt(params.id);

  // using id get snippet from database
  const snippet = await db.snippet.findFirst({
    where: { id },
  });

  // if no snippet, send to a not found page
  if (!snippet) {
    notFound();
  }
  return (
    <div>
      <p>Editing snippet title {snippet.title}</p>
      <SnippetEditForm snippet={snippet.code} />
    </div>
  );
}
