import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Content Format Preview",
  description: "Create and preview your content in different formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-5 bg-[#f5f5f5]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
