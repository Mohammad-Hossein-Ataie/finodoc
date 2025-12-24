'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import TagManager from './components/TagManager';
import ContentManager from './components/ContentManager';
import LetterTagger from './components/LetterTagger';
import TagReports from './components/TagReports';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tags' | 'content' | 'letters' | 'reports'>('tags');
  const router = useRouter();

  const tabOptions: Array<{ value: 'tags' | 'content' | 'reports' | 'letters'; label: string }> = [
    { value: 'tags', label: 'مدیریت تگ‌ها' },
    { value: 'content', label: 'مدیریت محتوا' },
    { value: 'reports', label: 'گزارش تگ‌ها' },
    { value: 'letters', label: 'تگ‌گذاری اطلاعیه‌ها' },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'admin') {
          router.push('/admin/login');
        } else {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 px-3 py-4 sm:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">پنل مدیریت</h1>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-sm text-muted-foreground truncate max-w-[60%] sm:max-w-none">{user.name}</span>
            <Button
              variant="outline"
              onClick={() => {
                fetch('/api/auth/me', { method: 'POST' }).then(() => router.push('/'));
              }}
            >
              خروج
            </Button>
          </div>
        </div>

        {/* Tabs: Select on mobile, buttons on desktop */}
        <div className="mb-4 sm:mb-6">
          <div className="sm:hidden">
            <label className="block text-sm mb-2 text-muted-foreground">بخش</label>
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              aria-label="انتخاب بخش پنل مدیریت"
            >
              {tabOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="hidden sm:flex gap-2 border-b pb-2">
            {tabOptions.map((t) => (
              <Button
                key={t.value}
                variant={activeTab === t.value ? 'default' : 'ghost'}
                onClick={() => setActiveTab(t.value)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-background p-4 sm:p-6 rounded-lg border">
          {activeTab === 'tags' && <TagManager />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'reports' && <TagReports />}
          {activeTab === 'letters' && <LetterTagger />}
        </div>
      </div>
    </div>
  );
}
