import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { evaluateAiTag, type CostRecord } from "@/lib/aitag-engine";

// Demo cost records for evaluation until real data is connected
const DEMO_COST_RECORDS: CostRecord[] = [
  { provider: "AWS", service: "Amazon EC2", region: "us-east-1", account: "prod-main", resourceName: "api-server-1", resourceType: "compute", tags: { team: "platform", env: "production", app: "api-gateway" }, cost: 680 },
  { provider: "AWS", service: "Amazon EC2", region: "us-east-1", account: "prod-main", resourceName: "api-server-2", resourceType: "compute", tags: { team: "platform", env: "production", app: "api-gateway" }, cost: 650 },
  { provider: "AWS", service: "Amazon RDS", region: "us-east-1", account: "prod-main", resourceName: "main-db-primary", resourceType: "database", tags: { team: "platform", env: "production", app: "user-service" }, cost: 230 },
  { provider: "AWS", service: "Amazon RDS", region: "us-east-1", account: "prod-main", resourceName: "analytics-db", resourceType: "database", tags: { team: "data", env: "production", app: "analytics-pipeline" }, cost: 195 },
  { provider: "GCP", service: "Google Compute Engine", region: "us-central1", account: "gcp-proj-1", resourceName: "ml-worker-pool", resourceType: "compute", tags: { team: "data-science", env: "production", app: "analytics-pipeline" }, cost: 180 },
  { provider: "GCP", service: "Google Compute Engine", region: "us-central1", account: "gcp-proj-1", resourceName: "staging-cluster", resourceType: "compute", tags: { team: "product", env: "staging", app: "user-service" }, cost: 85 },
  { provider: "AWS", service: "Amazon S3", region: "us-east-1", account: "prod-main", resourceName: "data-lake-bucket", resourceType: "storage", tags: { team: "data", env: "production", app: "analytics-pipeline" }, cost: 110 },
  { provider: "AWS", service: "Amazon S3", region: "us-east-1", account: "prod-main", resourceName: "static-assets", resourceType: "storage", tags: { team: "product", env: "production", app: "api-gateway" }, cost: 45 },
  { provider: "GCP", service: "Google BigQuery", region: "us-central1", account: "gcp-proj-1", resourceName: "analytics-warehouse", resourceType: "analytics", tags: { team: "data-science", env: "production", app: "analytics-pipeline" }, cost: 105 },
  { provider: "AWS", service: "AWS Lambda", region: "us-east-1", account: "prod-main", resourceName: "event-processor", resourceType: "serverless", tags: { team: "platform", env: "production", app: "api-gateway" }, cost: 65 },
  { provider: "AWS", service: "AWS Lambda", region: "us-west-2", account: "prod-west", resourceName: "data-transformer", resourceType: "serverless", tags: { team: "data", env: "production", app: "analytics-pipeline" }, cost: 42 },
  { provider: "AWS", service: "Amazon CloudFront", region: "global", account: "prod-main", resourceName: "cdn-distribution", resourceType: "network", tags: { team: "platform", env: "production", app: "api-gateway" }, cost: 52 },
  { provider: "GCP", service: "Google Cloud Storage", region: "us-central1", account: "gcp-proj-1", resourceName: "ml-model-artifacts", resourceType: "storage", tags: { team: "data-science", env: "production", app: "analytics-pipeline" }, cost: 38 },
  { provider: "AWS", service: "Amazon EBS", region: "us-east-1", account: "prod-main", resourceName: "vol-api-server-1", resourceType: "storage", tags: { team: "platform", env: "production", app: "api-gateway" }, cost: 40 },
  { provider: "AWS", service: "Amazon DynamoDB", region: "us-west-2", account: "prod-west", resourceName: "session-store", resourceType: "database", tags: { team: "product", env: "production", app: "user-service" }, cost: 32 },
  { provider: "AWS", service: "Amazon ElastiCache", region: "us-east-1", account: "prod-main", resourceName: "redis-cluster", resourceType: "cache", tags: { team: "platform", env: "production", app: "api-gateway" }, cost: 30 },
  { provider: "AWS", service: "Amazon Route53", region: "global", account: "prod-main", resourceName: "dns-zone", resourceType: "network", tags: { team: "platform", env: "production" }, cost: 12 },
  { provider: "AWS", service: "Amazon CloudWatch", region: "us-east-1", account: "prod-main", resourceName: "monitoring", resourceType: "monitoring", tags: { team: "platform", env: "production" }, cost: 10 },
  // Dev/sandbox resources
  { provider: "AWS", service: "Amazon EC2", region: "us-east-1", account: "dev-account", resourceName: "dev-server-1", resourceType: "compute", tags: { team: "product", env: "development", app: "user-service" }, cost: 120 },
  { provider: "AWS", service: "Amazon EC2", region: "us-east-1", account: "dev-account", resourceName: "sandbox-test", resourceType: "compute", tags: { env: "sandbox" }, cost: 55 },
  { provider: "GCP", service: "Google Compute Engine", region: "us-central1", account: "gcp-proj-1", resourceName: "dev-ml-instance", resourceType: "compute", tags: { team: "data-science", env: "development", app: "analytics-pipeline" }, cost: 75 },
  { provider: "AWS", service: "Amazon RDS", region: "us-east-1", account: "dev-account", resourceName: "dev-db", resourceType: "database", tags: { team: "product", env: "development", app: "user-service" }, cost: 68 },
  // Untagged resources
  { provider: "AWS", service: "Amazon EC2", region: "us-west-2", account: "prod-west", resourceName: "orphan-instance-1", resourceType: "compute", tags: {}, cost: 90 },
  { provider: "AWS", service: "Amazon S3", region: "us-east-1", account: "prod-main", resourceName: "temp-bucket-old", resourceType: "storage", tags: {}, cost: 25 },
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string; aitagId: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId, aitagId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const aiTag = await prisma.aiTag.findFirst({
    where: { id: aitagId, orgId },
    include: {
      rules: {
        include: { conditions: true },
        orderBy: { priority: "desc" },
      },
    },
  });

  if (!aiTag)
    return NextResponse.json({ error: "AiTag not found" }, { status: 404 });

  const config = {
    defaultValue: aiTag.defaultValue,
    rules: aiTag.rules.map((r) => ({
      valueName: r.valueName,
      priority: r.priority,
      conditions: r.conditions.map((c) => ({
        dimension: c.dimension,
        operator: c.operator,
        value: c.value,
        logicOp: c.logicOp,
      })),
    })),
  };

  const rawResults = evaluateAiTag(DEMO_COST_RECORDS, config);

  const totalCost = Object.values(rawResults).reduce((s, v) => s + v.cost, 0);
  const totalRecords = Object.values(rawResults).reduce(
    (s, v) => s + v.count,
    0
  );

  const results = Object.entries(rawResults)
    .map(([valueName, data]) => ({
      valueName,
      recordCount: data.count,
      totalCost: Math.round(data.cost * 100) / 100,
      percentage:
        totalCost > 0
          ? Math.round((data.cost / totalCost) * 10000) / 100
          : 0,
    }))
    .sort((a, b) => b.totalCost - a.totalCost);

  return NextResponse.json({
    aiTagId: aiTag.id,
    aiTagName: aiTag.name,
    totalRecords,
    totalCost: Math.round(totalCost * 100) / 100,
    results,
  });
}
