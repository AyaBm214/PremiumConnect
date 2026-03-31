import type { Metadata } from "next";
import { Inter, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ['400', '500', '700'], variable: '--font-dm-sans' });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ['400'], variable: '--font-dm-serif' });

export const metadata: Metadata = {
  title: "Premium Booking Connect",
  description: "Property Management Onboarding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} ${dmSerif.variable} font-sans`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
