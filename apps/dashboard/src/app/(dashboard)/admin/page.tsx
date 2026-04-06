'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { isSuperAdmin } from '@/lib/super-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  MessageSquare, Bug, Lightbulb, Star, Trash2, CheckCircle, Eye,
  Archive, Filter, ExternalLink,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  page: string;
  pageUrl: string;
  type: string;
  message: string;
  rating: number | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

interface Counts {
  total: number;
  new: number;
  reviewed: number;
  resolved: number;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  feedback: { icon: MessageSquare, color: 'bg-cyan-500/10 text-cyan-400', label: 'Feedback' },
  bug: { icon: Bug, color: 'bg-rose-500/10 text-rose-400', label: 'Bug Report' },
  feature_request: { icon: Lightbulb, color: 'bg-amber-500/10 text-amber-400', label: 'Feature Request' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  new: { color: 'bg-cyan-500/10 text-cyan-400', label: 'New' },
  reviewed: { color: 'bg-amber-500/10 text-amber-400', label: 'Reviewed' },
  resolved: { color: 'bg-emerald-500/10 text-emerald-400', label: 'Resolved' },
  archived: { color: 'bg-slate-500/10 text-slate-400', label: 'Archived' },
};

export default function AdminFeedbackPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currentOrgId } = useAppStore();

  // Only super admins can access this page
  const email = session?.user?.email;
  const isAdmin = isSuperAdmin(email);

  useEffect(() => {
    if (session && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [session, isAdmin, router]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, new: 0, reviewed: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const fetchFeedback = useCallback(async () => {
    if (!currentOrgId) return;
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterType) params.set('type', filterType);
      const res = await fetch(`/api/orgs/${currentOrgId}/feedback?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback || []);
        setCounts(data.counts || { total: 0, new: 0, reviewed: 0, resolved: 0 });
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [currentOrgId, filterStatus, filterType]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const updateStatus = async (id: string, status: string, note?: string) => {
    if (!currentOrgId) return;
    await fetch(`/api/orgs/${currentOrgId}/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote: note || undefined }),
    });
    fetchFeedback();
  };

  const deleteFeedback = async (id: string) => {
    if (!currentOrgId) return;
    await fetch(`/api/orgs/${currentOrgId}/feedback/${id}`, { method: 'DELETE' });
    fetchFeedback();
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner className="w-6 h-6 text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Feedback Admin</h1>
        <p className="text-slate-500 mt-1">Review and manage user feedback from across the platform.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-white' },
          { label: 'New', value: counts.new, color: 'text-cyan-400' },
          { label: 'Reviewed', value: counts.reviewed, color: 'text-amber-400' },
          { label: 'Resolved', value: counts.resolved, color: 'text-emerald-400' },
        ].map((c) => (
          <Card key={c.label} className="border-white/5">
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</div>
              <div className={`text-2xl font-display font-bold mt-1 ${c.color}`}>{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStatus ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/5'}`}
        >
          All
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === key ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/5'}`}
          >
            {cfg.label}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilterType(filterType === key ? '' : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === key ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/5'}`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner className="w-6 h-6 text-cyan-500" />
        </div>
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-10 h-10 text-slate-600 mb-4" />
          <h3 className="font-display font-semibold text-white mb-1">No feedback yet</h3>
          <p className="text-sm text-slate-400">User feedback will appear here when submitted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => {
            const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.feedback;
            const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;
            const TypeIcon = typeCfg.icon;
            const isExpanded = expandedId === item.id;

            return (
              <Card key={item.id} className="border-white/5 hover:border-white/10 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeCfg.color.split(' ')[0]}`}>
                      <TypeIcon className={`w-4 h-4 ${typeCfg.color.split(' ')[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{item.userName}</span>
                        <span className="text-xs text-slate-500">{item.userEmail}</span>
                        <Badge className={typeCfg.color}>{typeCfg.label}</Badge>
                        <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                        {item.rating && (
                          <span className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= item.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                            ))}
                          </span>
                        )}
                        <span className="text-xs text-slate-600 ml-auto">{formatDate(item.createdAt)}</span>
                      </div>

                      <p className="text-sm text-slate-300 mt-1.5">{item.message}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={item.pageUrl || item.page}
                          className="text-xs text-cyan-400/70 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                        >
                          {item.page} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {item.adminNote && (
                        <div className="mt-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                          <span className="text-xs text-slate-500">Admin note: </span>
                          <span className="text-xs text-slate-300">{item.adminNote}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {item.status === 'new' && (
                          <Button size="sm" variant="secondary" onClick={() => updateStatus(item.id, 'reviewed')}>
                            <Eye className="w-3 h-3 mr-1" /> Mark Reviewed
                          </Button>
                        )}
                        {item.status !== 'resolved' && (
                          <Button size="sm" variant="secondary" onClick={() => updateStatus(item.id, 'resolved')}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(item.id, 'archived')}>
                          <Archive className="w-3 h-3 mr-1" /> Archive
                        </Button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors ml-1"
                        >
                          {isExpanded ? 'Close' : 'Add Note'}
                        </button>
                        <button
                          onClick={() => deleteFeedback(item.id)}
                          className="text-xs text-slate-600 hover:text-rose-400 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Admin note input */}
                      {isExpanded && (
                        <div className="flex gap-2 mt-3">
                          <Input
                            placeholder="Add admin note..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="text-xs h-8"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              updateStatus(item.id, item.status, adminNote);
                              setAdminNote('');
                              setExpandedId(null);
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
