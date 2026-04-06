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

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const policyId = url.searchParams.get("policyId");

  const violations = await prisma.policyViolation.findMany({
    where: {
      policy: { orgId },
      ...(status && { status }),
      ...(policyId && { policyId }),
    },
    include: {
      policy: { select: { name: true } },
    },
    orderBy: { detectedAt: "desc" },
    take: 200,
  });

  return NextResponse.json(violations);
}
