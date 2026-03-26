
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { PWAHandler } from "@/components/PWAHandler";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ['400', '600', '700'],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mon assistant de courses",
  description: "Gérez votre garde-manger, planifiez vos repas et vos courses.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  themeColor: "#3B82F6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Assistant Courses",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          poppins.variable
        )}
      >
        <AuthProvider>
          <AuthGuard>
            {children}
            <PWAHandler />
          </AuthGuard>

        </AuthProvider>
      </body>
    </html>
  );
}
