import { prisma } from "./prisma";
import { cookies } from "next/headers";

export async function resolveCurrentOrg(userId: string): Promise<{
  orgId: string;
  orgName: string;
  role: string;
} | null> {
  const cookieStore = cookies();
  const savedOrgId = cookieStore.get("currentOrgId")?.value;

  if (savedOrgId) {
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: savedOrgId, userId } },
      include: { org: true },
    });
    if (membership) {
      return {
        orgId: membership.orgId,
        orgName: membership.org.name,
        role: membership.role,
      };
    }
  }

  // Fallback to first org
  const membership = await prisma.orgMember.findFirst({
    where: { userId },
    include: { org: true },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) return null;

  return {
    orgId: membership.orgId,
    orgName: membership.org.name,
    role: membership.role,
  };
}

export function setCurrentOrg(orgId: string) {
  cookies().set("currentOrgId", orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
