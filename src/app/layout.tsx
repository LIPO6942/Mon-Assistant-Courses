import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mon assistant de courses",
  description: "Gérez votre garde-manger, planifiez vos repas et vos courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          ptSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
