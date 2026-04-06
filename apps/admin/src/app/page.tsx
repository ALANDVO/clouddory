import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Cloud<span className="text-[#00e5c7]">Dory</span> Admin
          </h1>
          <p className="text-slate-400 text-sm">Super Admin Portal</p>
        </div>
        <div className="bg-[#0a0e27] border border-white/5 rounded-xl p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
