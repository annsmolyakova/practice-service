import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AuthProvider from "@/components/auth/auth-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Практика",
  description:
    "Сервис организации практики",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className="h-full antialiased"
    >
      <body
        className={`${inter.className} min-h-full flex flex-col`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
