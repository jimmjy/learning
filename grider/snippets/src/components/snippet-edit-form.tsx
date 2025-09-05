'use client';

import { Editor } from '@monaco-editor/react';

interface SnippetEditFormProps {
  snippet: string;
}

export const SnippetEditForm = ({ snippet }: SnippetEditFormProps) => {
  console.log({ snippet: snippet });
  return (
    <div>
      <p>edit form</p>
      <Editor
        // height="90vh"
        defaultLanguage="javascript"
        defaultValue={snippet}
      />
    </div>
  );
};
