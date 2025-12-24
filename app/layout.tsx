import type { Metadata, Viewport } from 'next';
import './globals.css';
import { vazir } from '@/lib/fonts';
import QueryProvider from '@/components/providers/QueryProvider';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Finodoc | سامانه نامه‌های کدال',
  description: 'مشاهده و جستجوی نامه‌های کدال',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${vazir.variable} font-sans bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <QueryProvider>
          <Header />
          <main className="flex-1 mx-auto w-full max-w-[1400px] px-2 sm:px-4 py-6">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
