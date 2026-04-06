import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; routeId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, routeId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const route = await prisma.alertRoute.findFirst({ where: { id: routeId, orgId } });
  if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });

  // Create a test notification instead of actually sending
  await prisma.notification.create({
    data: {
      orgId,
      userId,
      type: "alert_test",
      title: `Test alert: ${route.name}`,
      body: `This is a test notification from alert route "${route.name}" (${route.type}). If you received this, the route is configured correctly.`,
    },
  });

  return NextResponse.json({ ok: true, message: "Test notification created" });
}
