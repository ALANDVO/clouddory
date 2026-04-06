import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const aiTags = await prisma.aiTag.findMany({
    where: { orgId },
    include: {
      rules: {
        include: { conditions: true },
        orderBy: { priority: "desc" },
      },
    },
    orderBy: { priority: "desc" },
  });

  return NextResponse.json(aiTags);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, tagType, defaultValue, rules } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  // Check name uniqueness within org
  const existing = await prisma.aiTag.findUnique({
    where: { orgId_name: { orgId, name: name.trim() } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An AiTag with this name already exists in this organization" },
      { status: 409 }
    );
  }

  try {
    const aiTag = await prisma.$transaction(async (tx) => {
      const tag = await tx.aiTag.create({
        data: {
          orgId,
          name: name.trim(),
          description: description || null,
          tagType: tagType || "custom",
          defaultValue: defaultValue || "Unallocated",
        },
      });

      if (rules && Array.isArray(rules)) {
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          if (!rule.valueName || typeof rule.valueName !== "string") continue;

          const createdRule = await tx.aiTagRule.create({
            data: {
              aiTagId: tag.id,
              valueName: rule.valueName.trim(),
              priority: rule.priority ?? rules.length - i,
            },
          });

          if (rule.conditions && Array.isArray(rule.conditions)) {
            for (const cond of rule.conditions) {
              if (!cond.dimension || !cond.operator || !cond.value) continue;
              await tx.aiTagCondition.create({
                data: {
                  ruleId: createdRule.id,
                  dimension: cond.dimension,
                  operator: cond.operator,
                  value: cond.value,
                  logicOp: cond.logicOp || "AND",
                },
              });
            }
          }
        }
      }

      return tx.aiTag.findUnique({
        where: { id: tag.id },
        include: {
          rules: {
            include: { conditions: true },
            orderBy: { priority: "desc" },
          },
        },
      });
    });

    return NextResponse.json(aiTag, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create AiTag:", error);
    return NextResponse.json(
      { error: "Failed to create AiTag" },
      { status: 500 }
    );
  }
}
