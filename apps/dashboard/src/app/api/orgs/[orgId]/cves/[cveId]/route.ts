import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// PATCH: Update org-specific tracking for a CVE
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; cveId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, cveId } = await params;

  const member = await prisma.orgMember.findUnique({ where: { orgId_userId: { orgId, userId } } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { status, assignedTo, notes } = body;

  // cveId param here is the CVE ID string (e.g., CVE-2024-3094)
  const tracking = await prisma.orgCveTracking.upsert({
    where: { orgId_cveId: { orgId, cveId } },
    create: { orgId, cveId, status: status || "reviewing", assignedTo, notes },
    update: {
      ...(status !== undefined && { status }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(tracking);
}

// DELETE: Remove org tracking for a CVE (CVE stays in shared catalog)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; cveId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, cveId } = await params;

  const member = await prisma.orgMember.findUnique({ where: { orgId_userId: { orgId, userId } } });
  if (!member || !["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.orgCveTracking.deleteMany({ where: { orgId, cveId } });
  return NextResponse.json({ success: true });
}
