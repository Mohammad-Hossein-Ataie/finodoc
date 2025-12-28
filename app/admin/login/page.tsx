'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.replace('/admin');
        router.refresh();
        return;
      }

      setError(data.error || 'ورود ناموفق بود');
    } catch {
      setError('مشکلی پیش آمد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">ورود مدیر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">نام کاربری</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">رمز عبور</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button className="w-full" onClick={handleLogin} disabled={loading || !username || !password}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => router.push('/login')}>
            ورود کاربران/دانش‌آموزان (OTP)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
