import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createCloudAccountSchema } from "@/lib/validations";
import { encrypt } from "@/lib/encryption";

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

  const accounts = await prisma.cloudAccount.findMany({
    where: { orgId },
    select: {
      id: true,
      provider: true,
      name: true,
      externalId: true,
      status: true,
      lastSyncAt: true,
      lastError: true,
      syncIntervalHours: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(accounts);
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createCloudAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { provider, name, credentials } = parsed.data;
  const credentialsEnc = encrypt(JSON.stringify(credentials));

  const account = await prisma.cloudAccount.create({
    data: {
      orgId,
      provider,
      name,
      credentialsEnc,
    },
    select: {
      id: true,
      provider: true,
      name: true,
      externalId: true,
      status: true,
      lastSyncAt: true,
      lastError: true,
      syncIntervalHours: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(account, { status: 201 });
}
