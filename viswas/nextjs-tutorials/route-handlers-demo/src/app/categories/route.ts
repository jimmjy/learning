export const dynamic = "force-static";

export async function GET() {
  // This data would typically come from a database
  const categories = [
    {
      id: 1,
      name: "Electronics",
    },
    {
      id: 1,
      name: "Electronics",
    },
    {
      id: 1,
      name: "Electronics",
    },
    {
      id: 1,
      name: "Electronics",
    },
  ];

  return Response.json(categories);
}
