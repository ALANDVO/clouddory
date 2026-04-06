import { auth } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(orgId: string, minRole: string) {
  const session = await requireAuth();
  const userId = (session.user as any).id;

  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });

  if (!membership) {
    throw new Error("Not a member of this organization");
  }

  const userLevel = ROLE_HIERARCHY[membership.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

  if (userLevel < requiredLevel) {
    throw new Error("Insufficient permissions");
  }

  return { session, membership };
}

export async function getCurrentOrg(session: any) {
  const orgId = session?.currentOrgId;
  if (!orgId) return null;

  return prisma.organization.findUnique({
    where: { id: orgId },
  });
}
