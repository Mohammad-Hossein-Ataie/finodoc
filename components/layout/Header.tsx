import { Menu, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function Header() {
  const session = await getSession();
  const isLoggedIn = !!session;
  const displayName = (session as any)?.name || (session as any)?.mobile || 'کاربر';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center px-2 sm:px-4">
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
          {!isLoggedIn ? (
            <Button asChild className="h-10 px-4">
              <Link href="/login">ورود / ثبت‌نام</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="h-10 px-2 sm:px-3">
              <Link href="/profile" className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                <span className="max-w-[160px] truncate text-sm">{displayName}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
