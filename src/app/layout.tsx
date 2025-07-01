import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['400', '600', '700'],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mon assistant de courses",
  description: "Gérez votre garde-manger, planifiez vos repas et vos courses.",
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json?v=2" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          poppins.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
