'use client';

import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Heading2,
  Undo,
  Redo,
  RemoveFormatting,
  Table as TableIcon,
  Maximize2,
  Minimize2,
  ImagePlus,
  Video,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function RichTextEditor({ value, onChange, className = "" }: RichTextEditorProps) {
  const [fullscreen, setFullscreen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    // Next.js (App Router) pre-renders client components; prevent hydration mismatch.
    immediatelyRender: false,
    extensions: [
      TextStyle,
      Color,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded my-4',
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const addImage = useCallback(() => {
    const url = window.prompt("آدرس URL تصویر را وارد کنید:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const uploadImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [editor]);

  const uploadVideo = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      // Insert video as HTML
      editor.chain().focus().insertContent(`<video controls style="max-width: 100%; border-radius: 8px; margin: 12px 0;"><source src="${url}" type="${file.type}"></video>`).run();
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("خطا در آپلود ویدیو");
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }, [editor]);

  const addVideo = useCallback(() => {
    const url = window.prompt("آدرس URL ویدیو یا لینک یوتیوب را وارد کنید:");
    if (!url || !editor) return;

    // Check if it's a YouTube link
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    } else {
      // Insert video as HTML
      editor.chain().focus().insertContent(`<video controls style="max-width: 100%; border-radius: 8px; margin: 12px 0;"><source src="${url}"></video>`).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("آدرس لینک را وارد کنید:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, disabled, children, title }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-700"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div
      className={`${className} ${
        fullscreen
          ? "fixed inset-0 z-50 bg-white flex flex-col p-4"
          : "border rounded-lg overflow-hidden"
      }`}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={uploadImage}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={uploadVideo}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <ToolbarButton
          onClick={() => setFullscreen(!fullscreen)}
          title="تمام‌صفحه"
        >
          {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="بازگشت"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="جلو"
        >
          <Redo size={18} />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="بولد"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="ایتالیک"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="زیرخط"
        >
          <UnderlineIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="پاک کردن فرمت"
        >
          <RemoveFormatting size={18} />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="لیست"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="لیست شماره‌دار"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="نقل قول"
        >
          <Quote size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="کد"
        >
          <Code size={18} />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="لینک">
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="سرتیتر"
        >
          <Heading2 size={18} />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={addImage} title="افزودن تصویر از URL">
          <ImagePlus size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="آپلود تصویر"
        >
          <Upload size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={addVideo} title="افزودن ویدیو از URL">
          <Video size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading}
          title="آپلود ویدیو"
        >
          <Upload size={18} className="text-red-600" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={insertTable} title="افزودن جدول">
          <TableIcon size={18} />
        </ToolbarButton>

        {uploading && (
          <span className="text-xs text-gray-500 flex items-center mr-2">
            در حال آپلود...
          </span>
        )}
      </div>

      {/* Editor Area */}
      <div
        className={`prose prose-sm max-w-none ${
          fullscreen ? "flex-1 overflow-y-auto" : "min-h-[300px]"
        }`}
      >
        <EditorContent
          editor={editor}
          className="p-4 focus:outline-none h-full"
          dir="auto"
        />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: inherit;
        }
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #e5e7eb;
          padding: 8px 10px;
          min-width: 50px;
        }
        .ProseMirror th {
          background: #f3f4f6;
          font-weight: bold;
          text-align: center;
        }
        .ProseMirror tr:nth-child(even) td {
          background: #fafafa;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
        }
        .ProseMirror video {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 12px 0;
        }
        .ProseMirror iframe {
          border-radius: 8px;
          margin: 12px 0;
        }
      `}</style>
    </div>
  );
}
