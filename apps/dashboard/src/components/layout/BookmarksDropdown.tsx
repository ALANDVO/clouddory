'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bookmark, Trash2 } from 'lucide-react';

interface BookmarkItem {
  id: string;
  name: string;
  page: string;
  filterState: Record<string, unknown>;
  createdAt: string;
}

export default function BookmarksDropdown() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orgId) return;
    fetchBookmarks();
  }, [orgId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchBookmarks() {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/bookmarks`);
      if (!res.ok) return;
      const data = await res.json();
      setBookmarks(data);
    } catch {}
  }

  async function deleteBookmark(id: string) {
    if (!orgId) return;
    try {
      await fetch(`/api/orgs/${orgId}/bookmarks/${id}`, { method: 'DELETE' });
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {}
  }

  function navigateTo(bm: BookmarkItem) {
    const params = new URLSearchParams();
    if (bm.filterState && typeof bm.filterState === 'object') {
      Object.entries(bm.filterState).forEach(([k, v]) => {
        if (v !== null && v !== undefined) params.set(k, String(v));
      });
    }
    const qs = params.toString();
    router.push(qs ? `${bm.page}?${qs}` : bm.page);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Bookmarks"
      >
        <Bookmark className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-navy-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Saved Views</h3>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {bookmarks.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No bookmarks saved
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                >
                  <button
                    onClick={() => navigateTo(bm)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm text-slate-300 group-hover:text-white truncate">{bm.name}</p>
                    <p className="text-[10px] text-slate-600 truncate">{bm.page}</p>
                  </button>
                  <button
                    onClick={() => deleteBookmark(bm.id)}
                    className="shrink-0 p-1 text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
