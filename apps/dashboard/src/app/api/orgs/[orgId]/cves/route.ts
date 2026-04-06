import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET: List CVEs from shared catalog + merge per-org tracking status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({ where: { orgId_userId: { orgId, userId } } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const severity = url.searchParams.get("severity");
  const status = url.searchParams.get("status"); // from org tracking
  const cisaKev = url.searchParams.get("cisaKev");
  const search = url.searchParams.get("search");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 200);

  // Query shared catalog
  const where: any = {};
  if (severity && severity !== "all") where.severity = severity;
  if (cisaKev === "true") where.cisaKev = true;
  if (search) {
    where.OR = [
      { cveId: { contains: search } },
      { title: { contains: search } },
      { vendor: { contains: search } },
      { affectedProduct: { contains: search } },
    ];
  }

  const [catalogCves, total] = await Promise.all([
    prisma.cveCatalog.findMany({
      where,
      orderBy: [{ published: "desc" }],
      take: limit,
      include: {
        orgTracking: { where: { orgId }, take: 1 },
      },
    }),
    prisma.cveCatalog.count({ where }),
  ]);

  // Merge org-specific status into each CVE
  let cves = catalogCves.map((c) => {
    const tracking = c.orgTracking[0];
    return {
      id: c.id,
      cveId: c.cveId,
      severity: c.severity,
      cvssScore: c.cvssScore ? Number(c.cvssScore) : null,
      title: c.title,
      description: c.description,
      affectedProduct: c.affectedProduct,
      vendor: c.vendor,
      published: c.published.toISOString(),
      cisaKev: c.cisaKev,
      exploitAvailable: c.exploitAvailable,
      patchAvailable: c.patchAvailable,
      source: c.source,
      // Per-org fields
      status: tracking?.status || "new",
      assignedTo: tracking?.assignedTo || null,
      notes: tracking?.notes || null,
    };
  });

  // Filter by org tracking status if requested
  if (status && status !== "all") {
    cves = cves.filter((c) => c.status === status);
  }

  // Counts from catalog
  const allCatalog = await prisma.cveCatalog.findMany({
    select: { severity: true, cisaKev: true, patchAvailable: true, cveId: true },
  });
  const orgTracking = await prisma.orgCveTracking.findMany({
    where: { orgId },
    select: { cveId: true, status: true },
  });
  const trackingMap = new Map(orgTracking.map((t) => [t.cveId, t.status]));

  const counts = {
    total: allCatalog.length,
    critical: allCatalog.filter((c) => c.severity === "critical").length,
    high: allCatalog.filter((c) => c.severity === "high").length,
    medium: allCatalog.filter((c) => c.severity === "medium").length,
    low: allCatalog.filter((c) => c.severity === "low").length,
    cisaKev: allCatalog.filter((c) => c.cisaKev).length,
    patchAvailable: allCatalog.filter((c) => c.patchAvailable).length,
    mitigated: orgTracking.filter((t) => t.status === "mitigated").length,
    reviewing: orgTracking.filter((t) => t.status === "reviewing").length,
  };

  return NextResponse.json({ cves, counts, total });
}

// POST: Update org-specific tracking for a CVE (status, assignedTo, notes)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({ where: { orgId_userId: { orgId, userId } } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { cveId, status, assignedTo, notes } = body;

  if (!cveId) return NextResponse.json({ error: "cveId required" }, { status: 400 });

  // Upsert org tracking record
  const tracking = await prisma.orgCveTracking.upsert({
    where: { orgId_cveId: { orgId, cveId } },
    create: { orgId, cveId, status: status || "reviewing", assignedTo, notes },
    update: {
      ...(status && { status }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(tracking);
}
