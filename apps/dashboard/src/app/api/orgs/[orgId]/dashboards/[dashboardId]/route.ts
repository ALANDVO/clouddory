import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

async function verifyAccess(orgId: string, userId: string) {
  return prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string; dashboardId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, dashboardId } = await params;

  const member = await verifyAccess(orgId, userId);
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dashboard = await prisma.dashboard.findFirst({
    where: { id: dashboardId, orgId },
  });

  if (!dashboard)
    return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });

  return NextResponse.json(dashboard);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string; dashboardId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, dashboardId } = await params;

  const member = await verifyAccess(orgId, userId);
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, widgets, layout, isDefault } = body;

  const dashboard = await prisma.dashboard.update({
    where: { id: dashboardId },
    data: {
      ...(name !== undefined && { name }),
      ...(widgets !== undefined && { widgets }),
      ...(layout !== undefined && { layout }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  return NextResponse.json(dashboard);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; dashboardId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, dashboardId } = await params;

  const member = await verifyAccess(orgId, userId);
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.dashboard.delete({ where: { id: dashboardId } });

  return NextResponse.json({ success: true });
}
