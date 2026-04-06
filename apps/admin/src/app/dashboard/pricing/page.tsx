import { prisma } from "@/lib/prisma";
import PricingAdmin from "./pricing-admin";

export default async function PricingPage() {
  const plans = await prisma.pricingPlan.findMany({
    orderBy: { basePrice: "asc" },
  });

  const customerPricing = await (prisma as any).customerPricing.findMany({
    include: { org: { select: { name: true, slug: true } } },
    orderBy: { lockedAt: "desc" },
  });

  return <PricingAdmin initialPlans={plans as any} initialCustomerPricing={customerPricing as any} />;
}
