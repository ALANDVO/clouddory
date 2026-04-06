"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FeedbackItem {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  userEmail: string;
  page: string;
  pageUrl: string;
  type: string;
  message: string;
  rating: number | null;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  org: { id: string; name: string };
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-400/10 text-amber-400",
  reviewed: "bg-blue-400/10 text-blue-400",
  resolved: "bg-green-400/10 text-green-400",
  archived: "bg-slate-400/10 text-slate-400",
};

const TYPE_STYLES: Record<string, string> = {
  bug: "bg-red-400/10 text-red-400",
  feature_request: "bg-blue-400/10 text-blue-400",
  feedback: "bg-amber-400/10 text-amber-400",
};

export default function FeedbackTable({
  feedbacks,
}: {
  feedbacks: FeedbackItem[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  async function updateFeedback(
    id: string,
    data: { status?: string; adminNote?: string }
  ) {
    setUpdating(id);
    try {
      await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      router.refresh();
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="bg-[#0a0e27] border border-white/5 rounded-xl overflow-hidden">
      <div className="divide-y divide-white/5">
        {feedbacks.map((fb) => (
          <div key={fb.id}>
            <div
              className="px-6 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() =>
                setExpandedId(expandedId === fb.id ? null : fb.id)
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white font-medium">
                    {fb.userName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {fb.org.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {fb.userEmail}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      TYPE_STYLES[fb.type] || "bg-white/5 text-slate-400"
                    }`}
                  >
                    {fb.type.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      STATUS_STYLES[fb.status] || "bg-white/5 text-slate-400"
                    }`}
                  >
                    {fb.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-300 line-clamp-2">
                {fb.message}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">{fb.page}</span>
                <span className="text-xs text-slate-500">
                  {new Date(fb.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {expandedId === fb.id && (
              <div className="px-6 pb-4 border-t border-white/5 pt-4 bg-[#050816]/50">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Full Message</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                      {fb.message}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500">Page URL: </span>
                      <span className="text-slate-400 break-all text-xs">
                        {fb.pageUrl}
                      </span>
                    </div>
                    {fb.rating && (
                      <div>
                        <span className="text-xs text-slate-500">Rating: </span>
                        <span className="text-amber-400">
                          {"*".repeat(fb.rating)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Update */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-slate-500">
                      Update status:
                    </span>
                    {["new", "reviewed", "resolved", "archived"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => updateFeedback(fb.id, { status })}
                          disabled={
                            updating === fb.id || fb.status === status
                          }
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
                            fb.status === status
                              ? "bg-[#00e5c7]/20 text-[#00e5c7] cursor-default"
                              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                          } disabled:opacity-50`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>

                  {/* Admin Note */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Admin Note</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const note = (
                          form.elements.namedItem(
                            "adminNote"
                          ) as HTMLTextAreaElement
                        ).value;
                        updateFeedback(fb.id, { adminNote: note });
                      }}
                      className="flex gap-2"
                    >
                      <textarea
                        name="adminNote"
                        defaultValue={fb.adminNote || ""}
                        rows={2}
                        className="flex-1 px-3 py-2 bg-[#050816] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5c7]/50 resize-none"
                        placeholder="Add admin note..."
                      />
                      <button
                        type="submit"
                        disabled={updating === fb.id}
                        className="px-3 py-2 bg-[#00e5c7]/10 text-[#00e5c7] border border-[#00e5c7]/20 rounded-lg text-xs hover:bg-[#00e5c7]/20 transition-colors self-end disabled:opacity-50"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {feedbacks.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            No feedback found
          </div>
        )}
      </div>
    </div>
  );
}
