import Author from "@/app/posts-sequential/author";
import { Suspense } from "react";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

const url = "https://jsonplaceholder.typicode.com/posts";

export default async function PostsSequential() {
  const response = await fetch(url);
  const posts: Post[] = await response.json();

  const filteredPosts = posts.filter((post) => post.id % 10 === 1);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-800 leading-tight">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">{post.body}</p>
            <Suspense fallback={<p>Loading...</p>}>
              <Author userId={post.userId} />
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
}
