import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Providers from "@/components/shared/Providers";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <Providers>{children}</Providers>;
}
