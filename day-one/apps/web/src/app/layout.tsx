import { SanityLive } from "@/sanity/live";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        {children}
        <SanityLive />
      </body>
    </html>
  );
}
