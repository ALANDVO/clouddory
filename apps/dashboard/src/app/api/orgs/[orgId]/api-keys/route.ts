import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

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

  const keys = await prisma.apiKey.findMany({
    where: { orgId },
    select: { id: true, name: true, keyHash: true, lastUsed: true, createdAt: true, userId: true },
    orderBy: { createdAt: "desc" },
  });

  // Return key prefix (first 8 chars of hash) for display
  const result = keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyHash.substring(0, 8),
    lastUsed: k.lastUsed,
    createdAt: k.createdAt,
  }));

  return NextResponse.json(result);
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
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name } = body;
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  // Generate a random key
  const rawKey = `cdy_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.create({
    data: { userId, orgId, name, keyHash },
  });

  // Return the raw key ONCE — it cannot be retrieved again
  return NextResponse.json({ id: apiKey.id, name, key: rawKey, createdAt: apiKey.createdAt }, { status: 201 });
}
