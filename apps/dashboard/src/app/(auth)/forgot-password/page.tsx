"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request — no actual email sending yet
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {isSubmitted ? (
        <div className="flex flex-col items-center gap-5">
          {/* Success icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10">
            <svg
              className="h-7 w-7 text-cyan-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-white">Check your email</p>
            <p className="mt-1 text-sm text-slate-400">
              Check your email for a reset link. If you don&apos;t see it, check
              your spam folder.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full border-white/10"
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
          >
            Try a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" />
                Sending...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}

      {/* Back to login */}
      <p className="text-center text-sm text-slate-400">
        <Link
          href="/login"
          className="font-medium text-cyan-500 transition-colors hover:text-cyan-400"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
