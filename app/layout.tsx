import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/ui/app-toaster";

export const metadata: Metadata = {
  title: "Content Suite",
  description: "Brand governance + RAG + multimodal audit demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
