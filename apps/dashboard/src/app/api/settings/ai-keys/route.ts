import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
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

  const keys = await prisma.aiApiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      provider: true,
      label: true,
      isActive: true,
      lastUsed: true,
      errorCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json(keys);
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { provider, apiKey, label } = body;

  if (!provider || !apiKey) {
    return NextResponse.json({ error: "provider and apiKey are required" }, { status: 400 });
  }

  const encrypted = encrypt(apiKey);

  const key = await prisma.aiApiKey.create({
    data: {
      provider,
      apiKey: encrypted,
      label: label || null,
    },
    select: { id: true, provider: true, label: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(key);
}

export async function PUT(request: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, isActive } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updated = await prisma.aiApiKey.update({
    where: { id },
    data: { isActive },
    select: { id: true, isActive: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await prisma.aiApiKey.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
