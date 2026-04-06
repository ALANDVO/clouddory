import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import OAuthButtons from "@/components/auth/OAuthButtons";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — CloudDory",
  description: "Sign in to your CloudDory account",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Sign in to your CloudDory account
        </p>
      </div>

      {/* OAuth */}
      <OAuthButtons />

      {/* Divider */}
      <div className="relative flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      {/* Credentials form */}
      <LoginForm />

      {/* Footer link */}
      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-cyan-500 transition-colors hover:text-cyan-400"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
