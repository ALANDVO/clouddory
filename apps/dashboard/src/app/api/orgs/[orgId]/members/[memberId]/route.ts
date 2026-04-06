import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { updateMemberSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, memberId } = await params;

  const currentMember = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!currentMember) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["owner", "admin"].includes(currentMember.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMember = await prisma.orgMember.findUnique({
    where: { id: memberId },
  });
  if (!targetMember || targetMember.orgId !== orgId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (targetMember.role === "owner") {
    return NextResponse.json({ error: "Cannot change owner's role" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.orgMember.update({
    where: { id: memberId },
    data: { role: parsed.data.role },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, memberId } = await params;

  const currentMember = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!currentMember) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["owner", "admin"].includes(currentMember.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMember = await prisma.orgMember.findUnique({
    where: { id: memberId },
  });
  if (!targetMember || targetMember.orgId !== orgId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (targetMember.role === "owner") {
    return NextResponse.json({ error: "Cannot remove owner" }, { status: 403 });
  }

  await prisma.orgMember.delete({ where: { id: memberId } });

  return NextResponse.json({ success: true }, { status: 200 });
}
