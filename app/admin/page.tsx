'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TagManager from './components/TagManager';
import ContentManager from './components/ContentManager';
import LetterTagger from './components/LetterTagger';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tags' | 'content' | 'letters'>('tags');
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">پنل مدیریت</h1>
          <div className="flex gap-4">
             <span>{user.name}</span>
             <Button variant="outline" onClick={() => {
                 fetch('/api/auth/me', { method: 'POST' }).then(() => router.push('/'));
             }}>خروج</Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b pb-2">
          <Button 
            variant={activeTab === 'tags' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('tags')}
          >
            مدیریت تگ‌ها
          </Button>
          <Button 
            variant={activeTab === 'content' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('content')}
          >
            مدیریت محتوا
          </Button>
          <Button 
            variant={activeTab === 'letters' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('letters')}
          >
            تگ‌گذاری اطلاعیه‌ها
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === 'tags' && <TagManager />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'letters' && <LetterTagger />}
        </div>
      </div>
    </div>
  );
}
