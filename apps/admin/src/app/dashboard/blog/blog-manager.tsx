"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  status: string;
  tags: string[] | null;
  publishedAt: string | null;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  archived: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function BlogManager({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    setDeleting(id);
    try {
      await fetch(`https://dashboard.clouddory.com/api/blog/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-sm text-slate-400 mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/blog/new")}
          className="px-4 py-2 bg-[#00e5c7] text-[#050816] font-semibold text-sm rounded-lg hover:bg-[#00e5c7]/90 transition-colors"
        >
          + New Post
        </button>
      </div>

      <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4">Published</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-white truncate max-w-xs">
                    {post.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">/{post.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                      statusBadge[post.status] || statusBadge.draft
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {post.authorName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/blog/edit/${post.id}`)
                      }
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === post.id ? "..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No blog posts yet. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
