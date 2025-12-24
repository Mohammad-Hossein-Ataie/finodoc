'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'mobile' | 'code'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const normalizedMobile = mobile.replace(/\s+/g, '');
  const normalizedCode = code.replace(/\s+/g, '');

  const canSendOtp = normalizedMobile.length >= 10;
  const canVerifyOtp = normalizedCode.length >= 4;

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('code');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, code }),
      });
      const data = await res.json();
      if (res.ok) {
        // Redirect based on role or to home
        if (data.user.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-2 py-10 sm:px-0">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">ورود دانشجو</CardTitle>
            <CardDescription>
              برای ورود، شماره موبایل را وارد کنید تا کد یکبارمصرف ارسال شود.
            </CardDescription>

            <div className="mx-auto mt-2 flex w-full max-w-xs items-center justify-center gap-2 text-xs">
              <div
                className={`flex-1 rounded-md border px-2 py-1 text-center ${
                  step === 'mobile'
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                ۱) شماره موبایل
              </div>
              <div
                className={`flex-1 rounded-md border px-2 py-1 text-center ${
                  step === 'code'
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                ۲) کد تایید
              </div>
            </div>
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

            {step === 'mobile' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">شماره موبایل</label>
                  <Input
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0912xxxxxxx"
                    dir="ltr"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground">
                    شماره را بدون فاصله وارد کنید.
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={loading || !canSendOtp}
                >
                  {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  کد تایید به شماره
                  <span className="mx-1 font-medium" dir="ltr">
                    {normalizedMobile}
                  </span>
                  ارسال شد.
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">کد تایید</label>
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="12345"
                    dir="ltr"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={loading || !canVerifyOtp}
                >
                  {loading ? 'در حال بررسی...' : 'ورود'}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setError('');
                    setCode('');
                    setStep('mobile');
                  }}
                >
                  تغییر شماره
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
