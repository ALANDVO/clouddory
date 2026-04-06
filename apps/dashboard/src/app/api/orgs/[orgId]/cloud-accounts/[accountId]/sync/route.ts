import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { syncAwsCosts } from "@/lib/aws-sync";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string; accountId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, accountId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify the account belongs to the org
  const account = await prisma.cloudAccount.findFirst({
    where: { id: accountId, orgId },
  });

  if (!account) {
    return NextResponse.json(
      { error: "Cloud account not found" },
      { status: 404 }
    );
  }

  if (account.provider !== "aws") {
    return NextResponse.json(
      { error: `Sync not yet supported for provider: ${account.provider}` },
      { status: 400 }
    );
  }

  // Update status to syncing
  await prisma.cloudAccount.update({
    where: { id: accountId },
    data: { status: "syncing" },
  });

  const result = await syncAwsCosts(accountId);

  return NextResponse.json(result);
}
