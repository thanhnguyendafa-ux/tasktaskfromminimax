import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskTask - Task Management App",
  description: "A beautiful task management app with gamification and pet raising",
  manifest: "/manifest.json",
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
