import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { syncRecentCves, seedDemoCves } from "@/lib/cve-sync";

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

  // Seed demo data into SHARED catalog if empty
  const seeded = await seedDemoCves();

  // Sync from NVD into SHARED catalog (not per-org)
  const { synced, errors } = await syncRecentCves();

  const catalogCount = await prisma.cveCatalog.count();

  return NextResponse.json({
    seeded,
    synced,
    catalogTotal: catalogCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}
