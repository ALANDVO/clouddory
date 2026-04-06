import Logo from "@/components/shared/Logo";
import Providers from "@/components/shared/Providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="relative flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
        </div>

        <div className="relative w-full max-w-[420px]">
          {/* Logo + Branding */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <Logo className="h-12 w-12" />
            <span className="font-display text-xl font-semibold tracking-tight text-white">
              CloudDory
            </span>
          </div>

          {/* Card with glow border */}
          <div className="relative rounded-xl">
            {/* Subtle glow border effect */}
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-cyan-500/20 via-white/5 to-transparent opacity-60" />
            <div className="relative rounded-xl border border-white/[0.06] bg-navy-900/80 p-8 backdrop-blur-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Providers>
  );
}
