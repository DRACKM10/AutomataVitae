import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from '@/components/ParticleBackground';
import { GoogleOAuthProviderClient } from '@/components/GoogleOAuthProviderClient';
import { Toaster } from 'sonner';
import { ResumeProvider } from '@/context/store';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutomataVitae",
  description: "Your life automation assistant",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AutomataVitae",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-100 min-h-screen relative`}>
        <GoogleOAuthProviderClient>
          <ResumeProvider>
            <div className="fixed inset-0 z-[-1]">
              <ParticleBackground baseOpacity="opacity-40 dark:opacity-50" />
            </div>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ResumeProvider>
        </GoogleOAuthProviderClient>
      </body>
    </html>
  );
}
