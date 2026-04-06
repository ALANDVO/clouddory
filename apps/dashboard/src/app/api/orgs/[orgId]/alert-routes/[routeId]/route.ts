import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string; routeId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, routeId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, type, config, active } = body;

  const route = await prisma.alertRoute.update({
    where: { id: routeId },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(config !== undefined && { config }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(route);
}

export async function DELETE(
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
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.alertRoute.delete({ where: { id: routeId } });
  return NextResponse.json({ ok: true });
}
