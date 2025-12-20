import type { Metadata } from 'next';
import './globals.css';
import { vazir } from '@/lib/fonts';
import QueryProvider from '@/components/providers/QueryProvider';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Finodoc | سامانه نامه‌های کدال',
  description: 'مشاهده و جستجوی نامه‌های کدال',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} font-sans bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <QueryProvider>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
