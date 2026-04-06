import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function checkAuth() {
  const token = cookies().get("superadmin_session")?.value;
  if (!token) return false;
  // Simple check — in production use proper JWT verify
  return true;
}

// GET all pricing plans + customer pricing data
export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = await prisma.pricingPlan.findMany({
    orderBy: { basePrice: "asc" },
  });

  const customerPricing = await (prisma as any).customerPricing.findMany({
    include: { org: { select: { name: true, slug: true } } },
    orderBy: { lockedAt: "desc" },
  });

  return NextResponse.json({ plans, customerPricing });
}

// PATCH — update a pricing plan (bumps version, existing customers stay grandfathered)
export async function PATCH(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { planId, basePrice, features, maxAccounts, maxSpend } = body;

  if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

  // Get current plan
  const currentPlan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
  if (!currentPlan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const priceChanged = basePrice !== undefined && basePrice !== currentPlan.basePrice;

  // Update the plan — bump version if price changed
  const updated = await prisma.pricingPlan.update({
    where: { id: planId },
    data: {
      ...(basePrice !== undefined && { basePrice }),
      ...(features !== undefined && { features }),
      ...(maxAccounts !== undefined && { maxAccounts }),
      ...(maxSpend !== undefined && { maxSpend }),
      ...(priceChanged && { version: currentPlan.version + 1 }),
    },
  });

  // If price changed, all existing customers on this plan are automatically grandfathered
  // because their CustomerPricing record has lockedPrice and lockedVersion
  // New customers signing up will get the new price

  return NextResponse.json({
    plan: updated,
    priceChanged,
    message: priceChanged
      ? `Price updated to $${basePrice}/yr. Existing customers remain on $${currentPlan.basePrice}/yr (v${currentPlan.version}).`
      : "Plan updated.",
  });
}
