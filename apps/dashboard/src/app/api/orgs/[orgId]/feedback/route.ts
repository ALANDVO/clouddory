import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/super-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const email = session.user.email;
  const { orgId } = await params;

  // Super admin sees ALL feedback across all orgs
  if (isSuperAdmin(email)) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (orgId !== "all") where.orgId = orgId;
    if (status) where.status = status;
    if (type) where.type = type;

    const feedback = await prisma.feedback.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
    const counts = {
      total: await prisma.feedback.count({ where: orgId !== "all" ? { orgId } : {} }),
      new: await prisma.feedback.count({ where: { ...(orgId !== "all" ? { orgId } : {}), status: "new" } }),
      reviewed: await prisma.feedback.count({ where: { ...(orgId !== "all" ? { orgId } : {}), status: "reviewed" } }),
      resolved: await prisma.feedback.count({ where: { ...(orgId !== "all" ? { orgId } : {}), status: "resolved" } }),
    };
    return NextResponse.json({ feedback, counts });
  }

  // Regular org admin/owner can only see their org's feedback
  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member || !["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const page = searchParams.get("page");

  const where: any = { orgId };
  if (status) where.status = status;
  if (type) where.type = type;
  if (page) where.page = { contains: page };

  const feedback = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const counts = {
    total: await prisma.feedback.count({ where: { orgId } }),
    new: await prisma.feedback.count({ where: { orgId, status: "new" } }),
    reviewed: await prisma.feedback.count({ where: { orgId, status: "reviewed" } }),
    resolved: await prisma.feedback.count({ where: { orgId, status: "resolved" } }),
  };

  return NextResponse.json({ feedback, counts });
}

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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { page, pageUrl, type, message, rating } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const feedback = await prisma.feedback.create({
    data: {
      orgId,
      userId,
      userName: user?.name || "Unknown",
      userEmail: user?.email || "unknown",
      page: page || "/",
      pageUrl: pageUrl || "",
      type: type || "feedback",
      message: message.trim(),
      rating: rating || null,
    },
  });

  return NextResponse.json(feedback, { status: 201 });
}
