// app/layout.tsx

import Navbar from "./components/Navbar";
import "./globals.css"; // your global styles

export const metadata = {
  title: "My Blog",
  description: "Stories & Ideas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* Navbar will be visible on all pages */}
        <Navbar />

        {/* Main content */}
        <main>{children}</main>
      </body>
    </html>
  );
}