import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isSuperAdmin } from "@/lib/super-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || !isSuperAdmin(session.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      module: true,
      plan: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ subscriptions });
}
