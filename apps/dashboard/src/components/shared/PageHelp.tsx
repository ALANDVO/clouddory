'use client';

import { useState } from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PageHelpProps {
  title: string;
  description: string;
  steps?: string[];
  docUrl?: string;
}

export default function PageHelp({ title, description, steps, docUrl }: PageHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-7 h-7 rounded-full border border-white/10 bg-navy-800 hover:border-cyan-500/30 hover:bg-navy-700 transition-colors"
        aria-label="Page help"
      >
        <HelpCircle className="w-4 h-4 text-slate-400" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          {steps && steps.length > 0 && (
            <ol className="space-y-2 mt-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            {docUrl ? (
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                View full docs
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span />
            )}
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-semibold"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
