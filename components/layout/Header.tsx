import { UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/auth';

export default async function Header() {
  const session = await getSession();
  const isLoggedIn = !!session;
  const displayName = (session as any)?.name || (session as any)?.mobile || 'کاربر';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center px-2 sm:px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center">
            <Image
              src="/logo.png"
              alt="لوگو"
              width={160}
              height={40}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        <Link href="/" className="mr-2 flex items-center md:hidden">
          <Image
            src="/logo.png"
            alt="لوگو"
            width={140}
            height={36}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>
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
