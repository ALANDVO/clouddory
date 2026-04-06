import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

const CF_TEMPLATE_URL =
  process.env.NEXT_PUBLIC_CF_TEMPLATE_URL || "/cloudformation/clouddory-role.yaml";

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

  let body: { name?: string; curBucketName?: string; curPrefix?: string } = {};
  try {
    body = await request.json();
  } catch {
    // name is optional, allow empty body
  }

  const externalId = crypto.randomUUID();
  const accountName = body.name?.trim() || "AWS Account";
  const curBucketName = body.curBucketName?.trim() || "";
  const curPrefix = body.curPrefix?.trim() || "cur";

  // Create a pending cloud account record to track this setup flow
  const account = await prisma.cloudAccount.create({
    data: {
      orgId,
      provider: "aws",
      name: accountName,
      credentialsEnc: "", // will be filled on callback
      externalId,
      status: "pending_setup",
    },
    select: {
      id: true,
      externalId: true,
    },
  });

  const cfParams = [
    `?stackName=CloudDoryAccess`,
    `&templateURL=${encodeURIComponent(CF_TEMPLATE_URL)}`,
    `&param_ExternalId=${encodeURIComponent(externalId)}`,
  ];

  if (curBucketName) {
    cfParams.push(`&param_CURBucketName=${encodeURIComponent(curBucketName)}`);
    cfParams.push(`&param_CURBucketPrefix=${encodeURIComponent(curPrefix)}`);
  }

  const cloudFormationUrl =
    "https://console.aws.amazon.com/cloudformation/home#/stacks/create/review" +
    cfParams.join("");

  return NextResponse.json({
    accountId: account.id,
    externalId,
    cloudFormationUrl,
  });
}
