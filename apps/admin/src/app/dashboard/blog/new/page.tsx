"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

function renderMarkdown(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold text-white mt-4 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold text-white mt-6 mb-3'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold text-white mt-6 mb-3'>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Bullet lists
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-slate-300'>$1</li>")
    // Paragraphs
    .replace(/\n\n/g, "</p><p class='text-slate-300 mb-3'>");

  // Wrap in paragraph
  html = `<p class='text-slate-300 mb-3'>${html}</p>`;
  // Clean up empty paragraphs
  html = html.replace(/<p class='text-slate-300 mb-3'>\s*<\/p>/g, "");

  return html;
}

export default function NewBlogPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  const autoSlug = useCallback((t: string) => {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(autoSlug(val));
  }

  async function handleSave(publishNow?: boolean) {
    const finalStatus = publishNow ? "published" : status;
    setSaving(true);
    try {
      const res = await fetch(
        "https://dashboard.clouddory.com/api/blog/admin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title,
            excerpt,
            content,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            status: finalStatus,
            coverImage: coverImage || null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create post");
      router.push("/dashboard/blog");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.push("/dashboard/blog")}
            className="text-sm text-slate-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Blog
          </button>
          <h1 className="text-2xl font-bold text-white">New Blog Post</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !title}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !title}
            className="px-4 py-2 text-sm font-semibold text-[#050816] bg-[#00e5c7] rounded-lg hover:bg-[#00e5c7]/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title..."
            className="w-full px-4 py-3 text-2xl font-display font-bold text-white bg-transparent border border-white/10 rounded-xl focus:border-[#00e5c7]/50 focus:outline-none placeholder-slate-600"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 text-sm text-slate-300 bg-[#0a0e27] border border-white/10 rounded-lg focus:border-[#00e5c7]/50 focus:outline-none"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Brief description of the post..."
            className="w-full px-4 py-2.5 text-sm text-slate-300 bg-[#0a0e27] border border-white/10 rounded-lg focus:border-[#00e5c7]/50 focus:outline-none resize-none placeholder-slate-600"
          />
        </div>

        {/* Content editor with markdown preview */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Content (Markdown)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              placeholder="Write your content in markdown..."
              className="w-full px-4 py-3 text-sm text-slate-300 bg-[#0a0e27] border border-white/10 rounded-lg focus:border-[#00e5c7]/50 focus:outline-none resize-none font-mono placeholder-slate-600"
            />
            <div className="px-4 py-3 bg-[#0a0e27] border border-white/10 rounded-lg overflow-y-auto max-h-[600px]">
              {content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              ) : (
                <p className="text-slate-600 text-sm italic">
                  Preview will appear here...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tags and Cover Image */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="FinOps, Cloud Costs, AWS..."
              className="w-full px-4 py-2 text-sm text-slate-300 bg-[#0a0e27] border border-white/10 rounded-lg focus:border-[#00e5c7]/50 focus:outline-none placeholder-slate-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Cover Image URL
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 text-sm text-slate-300 bg-[#0a0e27] border border-white/10 rounded-lg focus:border-[#00e5c7]/50 focus:outline-none placeholder-slate-600"
            />
          </div>
        </div>

        {/* Status */}
        <div className="w-48">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 text-sm text-slate-300 bg-[#0a0e27] border border-white/10 rounded-lg focus:border-[#00e5c7]/50 focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
    </div>
  );
}
