// this will only change when the app is rebuilt
export const dynamic = "force-static";
// this will update every 10 seconds
export const revalidate = 10;

// caching example
export async function GET() {
  return Response.json({ time: new Date().toLocaleTimeString() });
}
