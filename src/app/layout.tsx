import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeaveHub - BCEA-Compliant Leave Management",
  description: "AI-powered leave management system for South African businesses",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-03.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
