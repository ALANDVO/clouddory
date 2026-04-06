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

  const policies = await prisma.labelPolicy.findMany({
    where: { orgId },
    include: { _count: { select: { violations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(policies);
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

  const { name, requiredTags, scopeFilter, enforcement } = body;
  if (!name || !requiredTags) {
    return NextResponse.json({ error: "name and requiredTags required" }, { status: 400 });
  }

  const policy = await prisma.labelPolicy.create({
    data: {
      orgId,
      name,
      requiredTags,
      scopeFilter: scopeFilter ?? null,
      enforcement: enforcement ?? "warn",
    },
  });

  return NextResponse.json(policy, { status: 201 });
}
