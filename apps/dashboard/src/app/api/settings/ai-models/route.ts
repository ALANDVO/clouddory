import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/super-admin";
import { NextResponse } from "next/server";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  if (!isSuperAdmin(session.user.email)) return null;
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const models = await prisma.aiModel.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(models);
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { modelId, displayName, provider } = body;

  if (!modelId || !displayName || !provider) {
    return NextResponse.json({ error: "modelId, displayName, and provider are required" }, { status: 400 });
  }

  // Get highest sort order
  const last = await prisma.aiModel.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? -1) + 1;

  const model = await prisma.aiModel.create({
    data: { modelId, displayName, provider, sortOrder },
  });

  return NextResponse.json(model);
}

export async function PUT(request: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const allowed: Record<string, unknown> = {};
  if (typeof updates.enabled === "boolean") allowed.enabled = updates.enabled;
  if (typeof updates.sortOrder === "number") allowed.sortOrder = updates.sortOrder;
  if (typeof updates.displayName === "string") allowed.displayName = updates.displayName;

  const model = await prisma.aiModel.update({
    where: { id },
    data: allowed,
  });

  return NextResponse.json(model);
}

export async function DELETE(request: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await prisma.aiModel.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
