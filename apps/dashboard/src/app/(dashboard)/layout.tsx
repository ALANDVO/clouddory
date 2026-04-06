import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveCurrentOrg } from "@/lib/org-context";
import { getOrgSubscriptions } from "@/lib/subscriptions";
import SessionWrapper from "@/components/layout/SessionWrapper";
import DashboardShell from "@/components/layout/DashboardShell";
import { SubscriptionProvider } from "@/components/shared/SubscriptionProvider";
import FeedbackButton from "@/components/shared/FeedbackButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;

  // Check if user belongs to any org
  const membership = await prisma.orgMember.findFirst({
    where: { userId },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  // Resolve current org and fetch subscriptions
  const orgContext = await resolveCurrentOrg(userId);
  const orgId = orgContext?.orgId ?? membership.orgId;

  const subscriptions = await getOrgSubscriptions(orgId);
  const serializedSubs = subscriptions.map((s) => ({
    module: s.module,
    status: s.status,
    plan: s.plan,
    trialEndsAt: s.trialEndsAt?.toISOString() ?? null,
    expiresAt: s.expiresAt?.toISOString() ?? null,
  }));

  return (
    <SessionWrapper>
      <SubscriptionProvider subscriptions={serializedSubs}>
        <DashboardShell orgId={orgId}>
          {children}
          <FeedbackButton />
        </DashboardShell>
      </SubscriptionProvider>
    </SessionWrapper>
  );
}
