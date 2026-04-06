import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string; reportId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, reportId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const digest = await prisma.scheduledDigest.findFirst({
    where: { id: reportId, orgId },
  });
  if (!digest) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  // Mock send: create a notification
  await prisma.notification.create({
    data: {
      orgId,
      userId,
      type: "budget_breach",
      title: `Report "${digest.name}" sent`,
      body: `Scheduled report "${digest.name}" was manually triggered.`,
    },
  });

  console.log(`[ScheduledDigest] Mock send for report "${digest.name}" (${reportId})`);

  return NextResponse.json({ ok: true, message: "Report sent (mock)" });
}
