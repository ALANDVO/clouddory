import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string; aitagId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, aitagId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const aiTag = await prisma.aiTag.findFirst({
    where: { id: aitagId, orgId },
    include: {
      rules: {
        include: { conditions: true },
        orderBy: { priority: "desc" },
      },
    },
  });

  if (!aiTag)
    return NextResponse.json({ error: "AiTag not found" }, { status: 404 });

  return NextResponse.json(aiTag);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; aitagId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, aitagId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.aiTag.findFirst({
    where: { id: aitagId, orgId },
  });
  if (!existing)
    return NextResponse.json({ error: "AiTag not found" }, { status: 404 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, defaultValue, isActive, rules } = body;

  // Check name uniqueness if name is being changed
  if (name && name.trim() !== existing.name) {
    const nameConflict = await prisma.aiTag.findUnique({
      where: { orgId_name: { orgId, name: name.trim() } },
    });
    if (nameConflict) {
      return NextResponse.json(
        { error: "An AiTag with this name already exists" },
        { status: 409 }
      );
    }
  }

  try {
    const aiTag = await prisma.$transaction(async (tx) => {
      await tx.aiTag.update({
        where: { id: aitagId },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(description !== undefined && { description }),
          ...(defaultValue !== undefined && { defaultValue }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      // If rules are provided, delete all existing and recreate
      if (rules && Array.isArray(rules)) {
        // Delete existing rules (conditions cascade)
        await tx.aiTagRule.deleteMany({ where: { aiTagId: aitagId } });

        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          if (!rule.valueName || typeof rule.valueName !== "string") continue;

          const createdRule = await tx.aiTagRule.create({
            data: {
              aiTagId: aitagId,
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
        where: { id: aitagId },
        include: {
          rules: {
            include: { conditions: true },
            orderBy: { priority: "desc" },
          },
        },
      });
    });

    return NextResponse.json(aiTag);
  } catch (error: any) {
    console.error("Failed to update AiTag:", error);
    return NextResponse.json(
      { error: "Failed to update AiTag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; aitagId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, aitagId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.aiTag.findFirst({
    where: { id: aitagId, orgId },
  });
  if (!existing)
    return NextResponse.json({ error: "AiTag not found" }, { status: 404 });

  await prisma.aiTag.delete({ where: { id: aitagId } });

  return NextResponse.json({ success: true });
}
