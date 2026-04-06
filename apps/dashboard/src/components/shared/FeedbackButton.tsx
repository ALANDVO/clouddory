'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MessageCircle, X, Send, Star, Bug, Lightbulb, MessageSquare, Bot, User, Loader2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

type Mode = 'chat' | 'feedback';

const FEEDBACK_TYPES = [
  { value: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-cyan-400' },
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-rose-400' },
  { value: 'feature_request', label: 'Feature', icon: Lightbulb, color: 'text-amber-400' },
];

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export default function FeedbackButton() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { currentOrgId } = useAppStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('chat');

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Feedback state
  const [fbType, setFbType] = useState('feedback');
  const [fbMessage, setFbMessage] = useState('');
  const [fbRating, setFbRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSubmitted, setFbSubmitted] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChat = async () => {
    if (!chatInput.trim() || !currentOrgId || chatLoading) return;
    const question = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/orgs/${currentOrgId}/dory-ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, currentPage: pathname }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || data.error || 'No response' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendFeedback = async () => {
    if (!fbMessage.trim() || !currentOrgId) return;
    setFbLoading(true);
    try {
      await fetch(`/api/orgs/${currentOrgId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pathname,
          pageUrl: window.location.href,
          type: fbType,
          message: fbMessage.trim(),
          rating: fbRating || null,
        }),
      });
      setFbSubmitted(true);
      setTimeout(() => { setFbSubmitted(false); setFbMessage(''); setFbRating(0); }, 2000);
    } catch { /* silent */ }
    finally { setFbLoading(false); }
  };

  if (!session) return null;

  // Simple markdown for chat: bold, bullets, line breaks
  const renderChat = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.slice(2);
        return <li key={i} className="ml-3 text-xs">{renderInline(content)}</li>;
      }
      if (trimmed === '') return <div key={i} className="h-1.5" />;
      return <p key={i} className="text-xs">{renderInline(trimmed)}</p>;
    });
  };

  const renderInline = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-cyan-300 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-cyan-500 text-navy-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 hover:shadow-cyan-500/30 transition-all duration-200 flex items-center justify-center"
        title={open ? 'Close' : 'DoryAI & Feedback'}
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[400px] max-h-[550px] rounded-xl border border-white/10 bg-navy-900 shadow-2xl shadow-black/40 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Mode tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setMode('chat')}
              className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === 'chat' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Bot className="w-3.5 h-3.5" /> DoryAI
            </button>
            <button
              onClick={() => setMode('feedback')}
              className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === 'feedback' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Feedback
            </button>
          </div>

          {mode === 'chat' ? (
            <>
              {/* Page context indicator */}
              <div className="px-3 pt-2 pb-0">
                <span className="text-[10px] text-slate-600 flex items-center gap-1">
                  Viewing: <span className="text-slate-400">{pathname}</span>
                </span>
              </div>
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px] max-h-[400px]">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-8 h-8 text-cyan-500/30 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Ask DoryAI about your cloud costs</p>
                    <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                      {['What am I spending on?', 'How can I save money?', 'Show anomalies'].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setChatInput(q); }}
                          className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.role === 'user' ? 'bg-cyan-500/10 text-white' : 'bg-white/5 text-slate-300'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-xs">{msg.content}</p>
                      ) : (
                        <div className="space-y-0.5">{renderChat(msg.content)}</div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2">
                      <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div className="border-t border-white/5 p-2.5 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Ask about your cloud costs..."
                  className="flex-1 h-8 rounded-lg border border-white/10 bg-navy-950 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-8 h-8 rounded-lg bg-cyan-500 text-navy-950 flex items-center justify-center hover:bg-cyan-400 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Feedback mode */
            <div className="p-4 space-y-3">
              {fbSubmitted ? (
                <div className="py-8 text-center">
                  <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Thank you!</p>
                  <p className="text-xs text-slate-400">Your feedback has been recorded.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500">Page: {pathname}</p>
                  <div className="flex gap-1.5">
                    {FEEDBACK_TYPES.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          onClick={() => setFbType(t.value)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                            fbType === t.value ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/[0.02] border border-white/5 text-slate-400'
                          }`}
                        >
                          <Icon className={`w-3 h-3 ${fbType === t.value ? t.color : ''}`} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder="Tell us what you think..."
                    className="w-full h-20 rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 resize-none"
                  />
                  <div>
                    <Label className="text-[10px] text-slate-500 mb-1 block">Rating</Label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setFbRating(s === fbRating ? 0 : s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}>
                          <Star className={`w-4 h-4 ${s <= (hoverRating || fbRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full h-8 text-xs" disabled={!fbMessage.trim() || fbLoading} onClick={sendFeedback}>
                    {fbLoading ? <LoadingSpinner className="w-3 h-3 mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                    Send Feedback
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
