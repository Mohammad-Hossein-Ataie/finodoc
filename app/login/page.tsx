'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'mobile' | 'code'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">ورود به سامانه</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}
          
          {step === 'mobile' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">شماره موبایل</label>
                <Input 
                  placeholder="0912..." 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)} 
                />
              </div>
              <Button className="w-full" onClick={handleSendOtp} disabled={loading || !mobile}>
                {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">کد تایید</label>
                <Input 
                  placeholder="12345" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                />
              </div>
              <Button className="w-full" onClick={handleVerifyOtp} disabled={loading || !code}>
                {loading ? 'در حال بررسی...' : 'ورود'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('mobile')}>
                تغییر شماره
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
