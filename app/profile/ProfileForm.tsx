'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type ProfileUser = {
  _id: string;
  name?: string;
  mobile?: string;
  email?: string;
  role?: 'user' | 'admin' | string;
};

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(false);
    setError('');

    const nextEmail = email.trim();
    if (nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError('ایمیل معتبر نیست.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: nextEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'ذخیره‌سازی ناموفق بود.');
        return;
      }

      if (data?.user) {
        if (typeof data.user.name === 'string') setName(data.user.name);
        if (typeof data.user.email === 'string') setEmail(data.user.email);
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError('مشکلی پیش آمد.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">پروفایل</CardTitle>
        <CardDescription>اطلاعات حساب کاربری‌تان را تکمیل کنید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm">
            تغییرات ذخیره شد.
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">شماره موبایل</label>
          <Input value={user.mobile || ''} readOnly dir="ltr" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">نام و نام خانوادگی</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام شما" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ایمیل</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
          />
        </div>

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </CardContent>
    </Card>
  );
}
