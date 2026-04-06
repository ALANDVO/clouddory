import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createOrgSchema } from "@/lib/validations";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createOrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, companySize } = parsed.data;

  let slug = generateSlug(name);
  if (!slug) {
    slug = `org-${randomSuffix()}`;
  }

  // Check uniqueness and append suffix if needed
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${randomSuffix()}`;
  }

  const org = await prisma.$transaction(async (tx) => {
    const newOrg = await tx.organization.create({
      data: {
        name,
        slug,
        companySize: companySize ?? null,
      },
    });

    await tx.orgMember.create({
      data: {
        orgId: newOrg.id,
        userId,
        role: "owner",
      },
    });

    return newOrg;
  });

  return NextResponse.json(org, { status: 201 });
}
