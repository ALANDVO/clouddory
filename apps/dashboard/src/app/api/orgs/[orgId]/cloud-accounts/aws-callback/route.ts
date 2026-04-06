import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
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

  let body: { roleArn?: string; externalId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { roleArn, externalId } = body;

  if (!roleArn || !externalId) {
    return NextResponse.json(
      { error: "roleArn and externalId are required" },
      { status: 400 }
    );
  }

  // Validate ARN format
  if (!roleArn.startsWith("arn:aws:iam::")) {
    return NextResponse.json(
      { error: "Invalid IAM Role ARN format" },
      { status: 400 }
    );
  }

  // Find the pending account matching this externalId
  const account = await prisma.cloudAccount.findFirst({
    where: {
      orgId,
      externalId,
      status: "pending_setup",
    },
  });

  if (!account) {
    return NextResponse.json(
      { error: "No pending account found for this externalId" },
      { status: 404 }
    );
  }

  // Encrypt the role ARN and store credentials
  const credentialsEnc = encrypt(JSON.stringify({ roleArn, externalId }));

  // Update to pending_verification — verification happens via the verify endpoint
  const updated = await prisma.cloudAccount.update({
    where: { id: account.id },
    data: {
      credentialsEnc,
      status: "pending_verification",
    },
    select: {
      id: true,
      provider: true,
      name: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
