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
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unread") === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      orgId,
      ...(unreadOnly ? { read: false } : {}),
      OR: [{ userId }, { userId: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      orgId,
      read: false,
      OR: [{ userId }, { userId: null }],
    },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const senderId = (session.user as any).id;
  const { orgId } = await params;

  // Verify the sender is a member of this org
  const senderMember = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId: senderId } },
  });
  if (!senderMember) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { userId?: string; type?: string; title?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, type, title, body: notifBody } = body;

  if (!userId || !type || !title || !notifBody) {
    return NextResponse.json(
      { error: "Missing required fields: userId, type, title, body" },
      { status: 400 }
    );
  }

  // SECURITY: Verify the target user is a member of this org
  const targetMember = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!targetMember) {
    return NextResponse.json(
      { error: "Target user is not a member of this organization" },
      { status: 403 }
    );
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        orgId,
        userId,
        type,
        title,
        body: notifBody,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    console.error("Failed to create notification:", err);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
