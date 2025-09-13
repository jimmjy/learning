type Author = {
  id: number;
  name: string;
};

const baseUrl = "https://jsonplaceholder.typicode.com/users";

export default async function Author({ userId }: { userId: number }) {
  await new Promise((r) => setTimeout(r, 1000));
  const response = await fetch(`${baseUrl}/${userId}`);
  const user: Author = await response.json();

  return (
    <div className="text-sm text-gray-500">
      Written by:{" "}
      <span className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
        {user.name}
      </span>
    </div>
  );
}
