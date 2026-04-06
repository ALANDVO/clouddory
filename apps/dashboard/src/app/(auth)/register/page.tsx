import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import OAuthButtons from "@/components/auth/OAuthButtons";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account — CloudDory",
  description: "Create your CloudDory account",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Start finding what your cloud is hiding
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

      {/* Registration form */}
      <RegisterForm />

      {/* Footer link */}
      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-cyan-500 transition-colors hover:text-cyan-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
