import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import { verifyAwsConnection } from "@/lib/aws-client";
import { NextResponse } from "next/server";

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
  if (!["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { cloudAccountId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { cloudAccountId } = body;
  if (!cloudAccountId) {
    return NextResponse.json(
      { error: "cloudAccountId is required" },
      { status: 400 }
    );
  }

  const account = await prisma.cloudAccount.findFirst({
    where: { id: cloudAccountId, orgId },
  });

  if (!account) {
    return NextResponse.json(
      { error: "Cloud account not found" },
      { status: 404 }
    );
  }

  if (!account.credentialsEnc) {
    return NextResponse.json(
      { error: "No credentials stored for this account" },
      { status: 400 }
    );
  }

  // Decrypt credentials
  let credentials: { roleArn?: string; externalId?: string };
  try {
    credentials = JSON.parse(decrypt(account.credentialsEnc));
  } catch {
    return NextResponse.json(
      { error: "Failed to decrypt credentials" },
      { status: 500 }
    );
  }

  if (account.provider === "aws") {
    if (!credentials.roleArn || !credentials.externalId) {
      return NextResponse.json(
        { error: "Incomplete AWS credentials" },
        { status: 400 }
      );
    }

    const result = await verifyAwsConnection(
      credentials.roleArn,
      credentials.externalId
    );

    // Update account status
    await prisma.cloudAccount.update({
      where: { id: cloudAccountId },
      data: {
        status: result.success ? "active" : "error",
        lastError: result.success ? null : (result.error || "Verification failed"),
      },
    });

    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: `Verification not supported for provider: ${account.provider}` },
    { status: 400 }
  );
}
