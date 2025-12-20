'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set('q', search);
      } else {
        params.delete('q');
      }
      // Reset page to 1 on search
      params.set('page', '1');
      
      // Only push if the query actually changed to avoid loops or unnecessary pushes
      if (params.get('q') !== searchParams.get('q')) {
          router.push(`/letters?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, router, searchParams]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 space-x-reverse">
            <span className="hidden font-bold sm:inline-block text-xl text-primary">
              فینوداک
            </span>
          </Link>
          <nav className="flex items-center space-x-6 space-x-reverse text-sm font-medium">
            <Link
              href="/letters"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              نامه‌های کدال
            </Link>
          </nav>
        </div>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex flex-1 items-center justify-end space-x-2 space-x-reverse">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در نماد، شرکت، عنوان..."
                className="pr-8 pl-2 md:w-[300px] lg:w-[400px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
