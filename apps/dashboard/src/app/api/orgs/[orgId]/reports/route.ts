import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const digests = await prisma.scheduledDigest.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(digests);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, dashboardId, frequency, channels } = body;
  if (!name || !frequency) {
    return NextResponse.json({ error: "name and frequency required" }, { status: 400 });
  }

  // Calculate next send date
  const now = new Date();
  let nextSendAt = new Date(now);
  if (frequency === "daily") nextSendAt.setDate(now.getDate() + 1);
  else if (frequency === "weekly") nextSendAt.setDate(now.getDate() + 7);
  else if (frequency === "monthly") nextSendAt.setMonth(now.getMonth() + 1);

  const digest = await prisma.scheduledDigest.create({
    data: {
      orgId,
      name,
      dashboardId: dashboardId || null,
      frequency,
      channels: channels ?? {},
      nextSendAt,
    },
  });

  return NextResponse.json(digest, { status: 201 });
}
