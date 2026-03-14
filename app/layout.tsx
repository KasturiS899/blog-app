// app/layout.tsx

import LayoutWrapper from "./components/LayoutWrapper";
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
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
