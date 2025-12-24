'use client';

import React, { useCallback, useRef } from "react";
import { Node, mergeAttributes } from '@tiptap/core';
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

const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      type: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const directSrc = dom.getAttribute('src');
          const source = dom.querySelector('source');
          const src = directSrc || source?.getAttribute('src');
          const type = source?.getAttribute('type') || dom.getAttribute('data-type');
          return { src, type };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type, ...rest } = HTMLAttributes as { src?: string; type?: string };

    // Persist as <video><source ... /></video> for broad compatibility.
    return [
      'video',
      mergeAttributes(rest, {
        controls: 'controls',
        ...(type ? { 'data-type': type } : {}),
      }),
      ['source', { ...(src ? { src } : {}), ...(type ? { type } : {}) }],
    ];
  },
});

const AudioNode = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      type: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const directSrc = dom.getAttribute('src');
          const source = dom.querySelector('source');
          const src = directSrc || source?.getAttribute('src');
          const type = source?.getAttribute('type') || dom.getAttribute('data-type');
          return { src, type };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type, ...rest } = HTMLAttributes as { src?: string; type?: string };
    return [
      'audio',
      mergeAttributes(rest, {
        controls: 'controls',
        ...(type ? { 'data-type': type } : {}),
      }),
      ['source', { ...(src ? { src } : {}), ...(type ? { type } : {}) }],
    ];
  },
});

export default function RichTextEditor({ value, onChange, className = "" }: RichTextEditorProps) {
  const [fullscreen, setFullscreen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

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
      VideoNode,
      AudioNode,
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

  const uploadMedia = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      if (file.type.startsWith('image/')) {
        editor.chain().focus().setImage({ src: url }).run();
        return;
      }

      if (file.type.startsWith('video/')) {
        editor
          .chain()
          .focus()
          .insertContent([
            { type: 'video', attrs: { src: url, type: file.type } },
            { type: 'paragraph' },
          ])
          .run();
        return;
      }

      if (file.type.startsWith('audio/')) {
        editor
          .chain()
          .focus()
          .insertContent([
            { type: 'audio', attrs: { src: url, type: file.type } },
            { type: 'paragraph' },
          ])
          .run();
        return;
      }

      alert("فرمت فایل پشتیبانی نمی‌شود");
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("خطا در آپلود فایل");
    } finally {
      setUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  }, [editor]);

  const addVideo = useCallback(() => {
    const url = window.prompt("آدرس URL ویدیو یا لینک یوتیوب را وارد کنید:");
    if (!url || !editor) return;

    // Check if it's a YouTube link
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent([{ type: 'video', attrs: { src: url } }, { type: 'paragraph' }])
        .run();
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
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={title}
        className={`group relative p-2 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed ${
          active ? "bg-accent text-foreground" : "text-foreground"
        }`}
      >
        {children}
        {title ? (
          <span
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            role="tooltip"
          >
            {title}
          </span>
        ) : null}
      </button>
    </div>
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
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={uploadMedia}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted">
        <ToolbarButton
          onClick={() => setFullscreen(!fullscreen)}
          title="تمام‌صفحه"
        >
          {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

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

        <div className="w-px bg-border mx-1" />

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

        <div className="w-px bg-border mx-1" />

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

        <div className="w-px bg-border mx-1" />

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

        <div className="w-px bg-border mx-1" />

        <ToolbarButton onClick={addImage} title="افزودن تصویر از URL">
          <ImagePlus size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => mediaInputRef.current?.click()}
          disabled={uploading}
          title="آپلود فایل (تصویر/ویدیو/صوت)"
        >
          <Upload size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={addVideo} title="افزودن ویدیو از URL">
          <Video size={18} />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton onClick={insertTable} title="افزودن جدول">
          <TableIcon size={18} />
        </ToolbarButton>

        {uploading && (
          <span className="text-xs text-muted-foreground flex items-center mr-2">
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
        .ProseMirror audio {
          width: 100%;
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
