import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

  // Get all active policies for this org
  const policies = await prisma.labelPolicy.findMany({
    where: { orgId },
  });

  if (policies.length === 0) {
    return NextResponse.json({ scanned: 0, violations: 0 });
  }

  // Get cost records that have tags
  const records = await prisma.costRecord.findMany({
    where: { orgId },
    select: { id: true, resourceId: true, tags: true, source: true },
    take: 500,
  });

  let violationCount = 0;

  for (const policy of policies) {
    const requiredTags = policy.requiredTags as string[];
    if (!Array.isArray(requiredTags)) continue;

    for (const record of records) {
      const tags = (record.tags as Record<string, string>) ?? {};
      const existingKeys = Object.keys(tags);
      const missing = requiredTags.filter((t) => !existingKeys.includes(t));

      if (missing.length > 0 && record.resourceId) {
        // Check if violation already exists
        const existing = await prisma.policyViolation.findFirst({
          where: {
            policyId: policy.id,
            resourceId: record.resourceId,
            status: "open",
          },
        });

        if (!existing) {
          await prisma.policyViolation.create({
            data: {
              policyId: policy.id,
              resourceId: record.resourceId,
              provider: record.source,
              missingTags: missing,
            },
          });
          violationCount++;
        }
      }
    }
  }

  return NextResponse.json({ scanned: records.length, violations: violationCount });
}
