import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orgId: string; entryId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, entryId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.manualEntry.findFirst({
    where: { id: entryId, orgId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, provider, service, cost, date, team, environment, notes } = body as {
    name: string;
    provider: string;
    service: string;
    cost: number;
    date: string;
    team?: string;
    environment?: string;
    notes?: string;
  };

  const entry = await prisma.manualEntry.update({
    where: { id: entryId },
    data: {
      name,
      provider,
      service,
      cost,
      date: new Date(date),
      team: team || null,
      environment: environment || null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ ...entry, cost: Number(entry.cost) });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; entryId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, entryId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.manualEntry.findFirst({
    where: { id: entryId, orgId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.manualEntry.delete({ where: { id: entryId } });

  return NextResponse.json({ success: true });
}
