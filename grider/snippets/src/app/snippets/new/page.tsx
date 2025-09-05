import { db } from '@/db';
import { redirect } from 'next/navigation';

export default function SnippetCreatePage() {
  async function createSnippet(formData: FormData) {
    // This needs to be a server action
    'use server';
    // check the user's inputs and make sure they're valid
    // these values come from the form name properties
    console.log({ formData });
    const title = formData.get('title') as string;
    const code = formData.get('code') as string;

    // create a new record in the database
    const snippet = await db.snippet.create({
      data: {
        title,
        code,
      },
    });

    // redirect to a root route with list of snippets
    redirect('/');
  }

  return (
    <form action={createSnippet}>
      <h3 className="font-bold m-3">Create a Snippet</h3>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <label className="w-12" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex gap-4">
          <label className="w-12" htmlFor="code">
            Code
          </label>
          <textarea
            id="code"
            name="code"
            className="border rounded p-2 w-full"
          />
        </div>
        <button className="rounded p-2 bg-blue-200" type="submit">
          Create
        </button>
      </div>
    </form>
  );
}
