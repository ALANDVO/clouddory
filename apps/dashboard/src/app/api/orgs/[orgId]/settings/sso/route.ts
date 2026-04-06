import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
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

  const configs = await prisma.ssoConfig.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(configs.length > 0 ? configs[0] : null);
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
  if (!member || !["admin", "owner"].includes(member.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { provider, entityId, ssoUrl, certificate, enabled } = body;
  if (!provider) return NextResponse.json({ error: "provider is required" }, { status: 400 });

  const config = await prisma.ssoConfig.upsert({
    where: { orgId_provider: { orgId, provider } },
    create: { orgId, provider, entityId, ssoUrl, certificate, enabled: enabled ?? false },
    update: { entityId, ssoUrl, certificate, enabled: enabled ?? false },
  });

  return NextResponse.json(config);
}
