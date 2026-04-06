'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Bot,
  User,
  Loader2,
  Table2,
  BarChart3,
  Hash,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/stores/app-store';

// ─── Types ─────────────────────────────────────────────────────

interface DataPayload {
  type: 'table' | 'metric' | 'chart';
  rows?: Record<string, unknown>[];
  value?: number;
  labels?: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: DataPayload;
  timestamp: Date;
}

// ─── Suggested Questions ───────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "What's my highest cost service?",
  "Which team spent the most on AWS?",
  "Show anomalies from last week",
  "Compare this month vs last month",
  "What are my biggest savings opportunities?",
];

// ─── Chart Colors ──────────────────────────────────────────────

const CHART_COLORS = [
  '#06b6d4',
  '#a855f7',
  '#f59e0b',
  '#10b981',
  '#f43f5e',
  '#3b82f6',
  '#f97316',
  '#ec4899',
];

// ─── Formatters ────────────────────────────────────────────────

function fmtUsd(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Data Panel Component ──────────────────────────────────────

function DataPanel({ data }: { data: DataPayload | undefined }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Ask a question to see data here</p>
      </div>
    );
  }

  if (data.type === 'metric' && data.value !== undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Hash className="w-8 h-8 text-cyan-400 mb-2" />
        <p className="text-3xl font-display font-bold text-white">{fmtUsd(data.value)}</p>
        <p className="text-sm text-slate-400 mt-1">Total Spend</p>
      </div>
    );
  }

  if (data.type === 'chart' && data.rows) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Comparison
        </h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={((value: any) => [fmtUsd(Number(value)), 'Cost']) as any}
              />
              <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (data.type === 'table' && data.rows && data.rows.length > 0) {
    const columns = Object.keys(data.rows[0]);
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Table2 className="w-4 h-4 text-cyan-400" />
          Results ({data.rows.length} rows)
        </h3>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((col) => (
                  <th key={col} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  {columns.map((col) => {
                    const val = row[col];
                    const isNumber = typeof val === 'number';
                    return (
                      <td key={col} className={`py-2 px-3 whitespace-nowrap ${isNumber ? 'text-right font-mono text-cyan-300' : 'text-slate-300'}`}>
                        {isNumber && col !== 'pct'
                          ? col === 'deviation' ? String(val) : fmtUsd(val)
                          : String(val ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
      No data to display
    </div>
  );
}

// ─── Markdown renderer (bold, lists, newlines) ─────────────────

function renderMarkdown(text: string) {
  // Split by double newlines for paragraphs, single newlines for line breaks
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-1 my-2 text-slate-300">
          {listItems.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Bullet list item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2));
      return;
    }

    // Numbered list item
    if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      return;
    }

    // Not a list item — flush any pending list
    flushList(`list-${i}`);

    // Empty line = paragraph break
    if (trimmed === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      return;
    }

    // Regular text line
    elements.push(<p key={`p-${i}`} className="text-slate-300">{renderInline(trimmed)}</p>);
  });

  flushList('list-end');
  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-cyan-300 font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="text-slate-200">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Main Page ─────────────────────────────────────────────────

export default function DoryAIPage() {
  const orgId = useAppStore((s) => s.currentOrgId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeData, setActiveData] = useState<DataPayload | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(question?: string) {
    const q = question ?? input.trim();
    if (!q || !orgId || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/orgs/${orgId}/dory-ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      const json = await res.json();

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: json.answer ?? json.error ?? 'Sorry, I could not process that.',
        data: json.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (json.data) setActiveData(json.data);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* ── Left: Chat Interface (70%) ── */}
      <div className="flex flex-col flex-[7] min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">DoryAI</h1>
            <p className="text-xs text-slate-400">Your cloud cost intelligence assistant</p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-800 border border-white/[0.06] mb-4">
                <Bot className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-lg font-display font-semibold text-white mb-1">
                Ask me anything about your cloud costs
              </h2>
              <p className="text-sm text-slate-400 max-w-md">
                I can help you find your top spending services, detect anomalies, compare monthly trends, and identify savings opportunities.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2.5 max-w-[85%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-navy-800 text-slate-300 border border-white/[0.06]'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/20'
                      : 'bg-navy-800 text-slate-200 border border-white/[0.06]'
                  }`}
                >
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-navy-800 text-slate-300 border border-white/[0.06]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-navy-800 border border-white/[0.06]">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing your data...
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-center gap-2 mt-2 shrink-0">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your cloud costs..."
            className="flex-1 bg-navy-800 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
            disabled={loading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            size="icon"
            className="bg-cyan-500 hover:bg-cyan-600 text-navy-950 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Right: Data Panel (30%) ── */}
      <Card className="flex-[3] bg-navy-900 border-white/[0.06] p-4 overflow-hidden min-w-0">
        <DataPanel data={activeData} />
      </Card>
    </div>
  );
}
