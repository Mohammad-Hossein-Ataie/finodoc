'use client';

import { useState, useEffect } from 'react';
// Removed Dialog import as the component does not exist and is not used
import { Button } from '@/components/ui/button';
import { Play, FileText, Music, Share2, Check, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RichContentViewer from '@/components/RichContentViewer';

interface ContentPlayerProps {
  tags: string[]; // Tag IDs
  isOpen: boolean;
  onClose: () => void;
}

export default function ContentPlayer({ tags, isOpen, onClose }: ContentPlayerProps) {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Check auth
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          setUser(data.user);
          if (data.user) {
            fetchContents();
          }
        });
    }
  }, [isOpen, tags]);

  const fetchContents = async () => {
    setLoading(true);
    const qs = tags.length > 0 ? `?tagIds=${encodeURIComponent(tags.join(','))}` : '';
    const res = await fetch(`/api/content${qs}`);
    const data = await res.json();
    setContents(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleShare = async (content: any) => {
    if (!content?.url) return;
    const shareData = {
      title: content.title,
      text: `محتوای فینوداک: ${content.title}`,
      url: content.url
    };

    // Try Web Share API first
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or error - fallback to copy
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(content.url);
      setCopiedId(content._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-black">✕</button>
        
        <h2 className="text-xl font-bold mb-4">محتوای آموزشی و تحلیلی</h2>

        {!user ? (
          <div className="text-center py-8">
            <p className="mb-4">برای مشاهده محتوا باید وارد شوید.</p>
            <Button onClick={() => router.push('/login')}>ورود / ثبت نام</Button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">در حال بارگذاری...</div>
        ) : contents.length === 0 ? (
          <div className="text-center py-8">محتوایی یافت نشد.</div>
        ) : (
          <div className="space-y-4">
            {contents.map((content) => (
              <div key={content._id} className="border p-4 rounded flex items-start gap-4">
                <div className="bg-gray-100 p-2 rounded">
                    {content.type === 'video' && <Play className="h-6 w-6 text-blue-500" />}
                    {content.type === 'audio' && <Music className="h-6 w-6 text-green-500" />}
                    {(content.type === 'text' || content.type === 'pdf' || content.type === 'rich-text') && <FileText className="h-6 w-6 text-orange-500" />}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold">{content.title}</h3>
                    <div className="mt-2">
                        {content.type === 'video' || content.type === 'audio' ? (
                          <video controls className="w-full max-h-64 bg-black" src={content.url} />
                        ) : content.type === 'rich-text' || content.type === 'text' ? (
                          <RichContentViewer content={content.richContent || ''} />
                        ) : (
                          <a href={content.url} target="_blank" className="text-blue-500 underline">مشاهده فایل</a>
                        )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      {!content.url ? null : (
                        <button
                          onClick={() => handleShare(content)}
                          className="
                            group relative inline-flex items-center gap-2 px-4 py-2 
                            text-sm font-medium text-gray-700 bg-white 
                            border border-gray-300 rounded-lg 
                            hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700
                            transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          "
                        >
                          {copiedId === content._id ? (
                            <>
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">کپی شد!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              <span>اشتراک‌گذاری</span>
                            </>
                          )}
                          
                          {/* Tooltip */}
                          <span className="
                            absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                            px-3 py-1 text-xs text-white bg-gray-900 rounded
                            opacity-0 group-hover:opacity-100 pointer-events-none
                            transition-opacity duration-200 whitespace-nowrap
                          ">
                            اشتراک یا کپی لینک
                          </span>
                        </button>
                      )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
