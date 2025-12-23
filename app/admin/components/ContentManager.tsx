'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import toast, { Toaster } from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';

export default function ContentManager() {
  const [contents, setContents] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video');
  const [richContent, setRichContent] = useState('');
  const [tags, setTags] = useState<any[]>([]); // Available tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    const res = await fetch('/api/content');
    const data = await res.json();
    setContents(data);
  };

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    setTags(data);
  };

  useEffect(() => {
    fetchContent();
    fetchTags();
  }, []);

  const handleUpload = async () => {
    if (!title) {
      toast.error('لطفا عنوان را وارد کنید');
      return;
    }

    // برای محتوای متنی (rich-text) فایل اجباری نیست
    if (type !== 'rich-text' && !file) {
      toast.error('لطفا فایل را انتخاب کنید');
      return;
    }

    setLoading(true);

    try {
      let url = '';

      // اگر فایل وجود داشته باشد، آپلود کن
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          toast.error('خطا در آپلود فایل');
          setLoading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        url = uploadData.url;
      }

      // ذخیره metadata
      const contentData: any = {
        title,
        type,
        tags: selectedTags,
      };

      // اگر نوع rich-text است، محتوای HTML را ذخیره کن
      if (type === 'rich-text') {
        contentData.richContent = richContent;
      } else {
        contentData.url = url;
      }

      const contentRes = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });

      if (!contentRes.ok) {
        const errorData = await contentRes.json();
        toast.error(`خطا در ذخیره محتوا: ${errorData.details || errorData.error}`);
        setLoading(false);
        return;
      }

      toast.success('محتوا با موفقیت ذخیره شد');
      setFile(null);
      setTitle('');
      setRichContent('');
      setSelectedTags([]);
      fetchContent();
    } catch (error: any) {
      toast.error(`خطا: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter(t => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-xl font-bold mb-4">مدیریت محتوا</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4 border p-4 rounded">
          <h3 className="font-bold">آپلود جدید</h3>
          <div>
            <label className="block text-sm mb-1">عنوان</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">نوع</label>
            <select 
                className="w-full border rounded p-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="video">ویدیو</option>
                <option value="audio">صوت</option>
                <option value="text">متن</option>
                <option value="pdf">PDF</option>
                <option value="image">تصویر</option>
                <option value="rich-text">متن غنی (Rich Text)</option>
            </select>
          </div>
          
          {/* اگر نوع rich-text انتخاب شد، ویرایشگر متن را نشان بده */}
          {type === 'rich-text' ? (
            <div>
              <label className="block text-sm mb-1">محتوای متنی</label>
              <RichTextEditor value={richContent} onChange={setRichContent} />
            </div>
          ) : (
            <div>
              <label className="block text-sm mb-1">فایل</label>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          )}
          
          <div>
            <label className="block text-sm mb-1">تگ‌ها</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded">
                {tags.map(tag => (
                    <div 
                        key={tag._id} 
                        onClick={() => toggleTag(tag._id)}
                        className={`cursor-pointer px-2 py-1 rounded text-xs ${selectedTags.includes(tag._id) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {tag.name}
                    </div>
                ))}
            </div>
          </div>

          <Button onClick={handleUpload} disabled={loading || (type !== 'rich-text' && !file)}>
            {loading ? 'در حال ذخیره...' : 'ذخیره محتوا'}
          </Button>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold">لیست محتوا</h3>
            {contents.map(c => (
                <Card key={c._id} className="p-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-bold">{c.title}</div>
                            <div className="text-xs text-gray-500">{c.type}</div>
                            <div className="flex gap-1 mt-1">
                                {c.tags.map((t: any) => (
                                    <span key={t._id} className="bg-gray-100 text-xs px-1 rounded">{t.name}</span>
                                ))}
                            </div>
                        </div>
                        {c.type === 'rich-text' ? (
                            <span className="text-sm text-green-600">متن غنی</span>
                        ) : (
                            <a href={c.url} target="_blank" className="text-blue-500 text-sm">مشاهده</a>
                        )}
                    </div>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
