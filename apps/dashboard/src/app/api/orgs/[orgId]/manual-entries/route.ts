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

  const entries = await prisma.manualEntry.findMany({
    where: { orgId },
    orderBy: { date: "desc" },
  });

  // Serialize Decimal fields to numbers
  const serialized = entries.map((e) => ({
    ...e,
    cost: Number(e.cost),
  }));

  return NextResponse.json(serialized);
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

  if (!name || !provider || !service || cost === undefined || !date) {
    return NextResponse.json(
      { error: "name, provider, service, cost, and date are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.manualEntry.create({
    data: {
      orgId,
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

  // Also inject into cost_records as source="manual"
  await prisma.costRecord.create({
    data: {
      orgId,
      date: new Date(date),
      service,
      cost,
      source: "manual",
      team: team || null,
      environment: environment || null,
    },
  });

  return NextResponse.json({ ...entry, cost: Number(entry.cost) }, { status: 201 });
}
