import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const ORG_ID = "cmms33po60001h2nj0fvqfjda";
const USER_ID = "cmmrzwjf90000c0jnrgb9neh8";

const teams = [
  "Platform Engineering",
  "Product",
  "Data Science",
  "Security",
  "Infrastructure",
];
const environments = ["production", "staging", "development", "sandbox"];
const regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function decimal(val: number): Prisma.Decimal {
  return new Prisma.Decimal(val.toFixed(4));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Service definitions: [source, service, minCost, maxCost, resourceType?]
interface ServiceDef {
  source: string;
  service: string;
  min: number;
  max: number;
  resourceType?: string;
  isAI?: boolean;
  model?: string;
}

const serviceDefs: ServiceDef[] = [
  // AWS
  { source: "aws", service: "EC2", min: 80, max: 450, resourceType: "Instance" },
  { source: "aws", service: "RDS", min: 40, max: 280, resourceType: "DBInstance" },
  { source: "aws", service: "S3", min: 5, max: 60, resourceType: "Bucket" },
  { source: "aws", service: "Lambda", min: 2, max: 45, resourceType: "Function" },
  { source: "aws", service: "EKS", min: 50, max: 320, resourceType: "Cluster" },
  { source: "aws", service: "CloudFront", min: 10, max: 85, resourceType: "Distribution" },
  { source: "aws", service: "DynamoDB", min: 8, max: 120, resourceType: "Table" },
  { source: "aws", service: "ElastiCache", min: 15, max: 110, resourceType: "CacheCluster" },
  // GCP
  { source: "gcp", service: "Compute Engine", min: 60, max: 350, resourceType: "Instance" },
  { source: "gcp", service: "BigQuery", min: 20, max: 200, resourceType: "Dataset" },
  { source: "gcp", service: "Cloud Storage", min: 3, max: 40, resourceType: "Bucket" },
  { source: "gcp", service: "GKE", min: 40, max: 260, resourceType: "Cluster" },
  // Azure
  { source: "azure", service: "Virtual Machines", min: 70, max: 400, resourceType: "VM" },
  { source: "azure", service: "SQL Database", min: 30, max: 220, resourceType: "Database" },
  { source: "azure", service: "Blob Storage", min: 4, max: 50, resourceType: "StorageAccount" },
  // Datadog
  { source: "datadog", service: "Infrastructure", min: 20, max: 150, resourceType: "Host" },
  { source: "datadog", service: "APM", min: 15, max: 100, resourceType: "Service" },
  { source: "datadog", service: "Logs", min: 10, max: 80, resourceType: "Index" },
  // Snowflake
  { source: "snowflake", service: "Compute", min: 30, max: 250, resourceType: "Warehouse" },
  { source: "snowflake", service: "Storage", min: 5, max: 60, resourceType: "Database" },
  // AI providers
  { source: "openai", service: "GPT-4", min: 5, max: 80, isAI: true, model: "gpt-4" },
  { source: "openai", service: "GPT-4o", min: 3, max: 50, isAI: true, model: "gpt-4o" },
  { source: "openai", service: "Embeddings", min: 1, max: 15, isAI: true, model: "text-embedding-3-large" },
  { source: "anthropic", service: "Claude 3.5 Sonnet", min: 8, max: 90, isAI: true, model: "claude-3-5-sonnet" },
  { source: "anthropic", service: "Claude 3 Haiku", min: 2, max: 25, isAI: true, model: "claude-3-haiku" },
];

async function seedCostRecords() {
  console.log("Seeding cost records (90 days)...");
  const records: Prisma.CostRecordCreateManyInput[] = [];

  for (let day = 0; day < 90; day++) {
    const date = daysAgo(day);
    // Weekend discount factor
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.0;

    for (const svc of serviceDefs) {
      // Each service gets 1-3 records per day (different teams/regions)
      const count = svc.isAI ? 1 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const baseCost = rand(svc.min, svc.max) * weekendFactor;
        // Add daily variance +-15%
        const variance = 1 + rand(-0.15, 0.15);
        const cost = baseCost * variance;
        const team = pick(teams);
        const environment = pick(environments);
        const region = pick(regions);

        const record: Prisma.CostRecordCreateManyInput = {
          orgId: ORG_ID,
          date,
          service: svc.service,
          source: svc.source,
          region,
          resourceType: svc.resourceType,
          resourceId: `${svc.source}-${svc.service.toLowerCase().replace(/\s+/g, "-")}-${region}-${i}`,
          cost: decimal(cost),
          currency: "USD",
          team,
          environment,
          tags: { team, environment, source: svc.source },
        };

        if (svc.isAI) {
          const tokens = Math.floor(rand(10000, 500000));
          const requests = Math.floor(rand(50, 5000));
          record.tokenCount = tokens;
          record.model = svc.model;
          record.requestCount = requests;
          record.usage = decimal(tokens);
          record.usageUnit = "tokens";
        } else if (svc.service === "S3" || svc.service === "Cloud Storage" || svc.service === "Blob Storage") {
          record.usage = decimal(rand(10, 5000));
          record.usageUnit = "GB";
        } else if (svc.service === "Lambda") {
          record.usage = decimal(rand(100000, 10000000));
          record.usageUnit = "requests";
        } else {
          record.usage = decimal(rand(1, 744));
          record.usageUnit = "hours";
        }

        records.push(record);
      }
    }
  }

  // Batch insert in chunks of 500
  for (let i = 0; i < records.length; i += 500) {
    await prisma.costRecord.createMany({ data: records.slice(i, i + 500) });
  }
  console.log(`  Created ${records.length} cost records`);
}

async function seedConnectors() {
  console.log("Seeding connectors...");
  const connectors: { name: string; providerType: string; status: string }[] = [
    { name: "AWS Production", providerType: "aws", status: "connected" },
    { name: "AWS Staging", providerType: "aws", status: "connected" },
    { name: "GCP Main", providerType: "gcp", status: "connected" },
    { name: "Azure Enterprise", providerType: "azure", status: "connected" },
    { name: "OCI Tenancy", providerType: "oci", status: "pending" },
    { name: "OpenAI Platform", providerType: "openai", status: "connected" },
    { name: "Anthropic API", providerType: "anthropic", status: "connected" },
    { name: "Datadog Monitoring", providerType: "datadog", status: "connected" },
    { name: "Snowflake DW", providerType: "snowflake", status: "connected" },
    { name: "Databricks Workspace", providerType: "databricks", status: "error" },
    { name: "Kubernetes Prod", providerType: "kubernetes", status: "connected" },
    { name: "Slack Integration", providerType: "slack", status: "connected" },
    { name: "Jira Cloud", providerType: "jira", status: "pending" },
    { name: "ServiceNow ITSM", providerType: "servicenow", status: "disconnected" },
    { name: "Microsoft Teams", providerType: "teams", status: "pending" },
  ];

  for (const c of connectors) {
    await prisma.connector.create({
      data: {
        orgId: ORG_ID,
        name: c.name,
        providerType: c.providerType,
        status: c.status,
        lastSyncedAt: c.status === "connected" ? daysAgo(Math.floor(rand(0, 2))) : null,
        config: { region: pick(regions) },
      },
    });
  }
  console.log(`  Created ${connectors.length} connectors`);
}

async function seedWasteScanResults() {
  console.log("Seeding waste scan results...");
  const scans = [
    { scanType: "idle_resources", resourceId: "i-0abc123def456", provider: "aws", service: "EC2", region: "us-east-1", monthlyWasteCost: 342.50, recommendation: "Instance i-0abc123def456 has averaged <2% CPU utilization over the past 30 days. Consider stopping or downsizing to t3.small.", severity: "high" },
    { scanType: "rightsizing", resourceId: "i-0fed987cba654", provider: "aws", service: "EC2", region: "us-west-2", monthlyWasteCost: 186.00, recommendation: "Instance i-0fed987cba654 (m5.2xlarge) consistently uses <30% CPU and <20% memory. Recommend downsizing to m5.large, saving ~$186/month.", severity: "medium" },
    { scanType: "orphaned_storage", resourceId: "vol-0123456789abc", provider: "aws", service: "EBS", region: "us-east-1", monthlyWasteCost: 45.60, recommendation: "EBS volume vol-0123456789abc (500GB gp3) has been unattached for 45 days. Consider creating a snapshot and deleting the volume.", severity: "low" },
    { scanType: "unused_commitments", resourceId: "ri-abc123", provider: "aws", service: "EC2", region: "us-east-1", monthlyWasteCost: 520.00, recommendation: "Reserved Instance ri-abc123 (r5.xlarge, us-east-1a) has only 12% utilization. Consider modifying to match current workload or selling on RI Marketplace.", severity: "critical" },
    { scanType: "idle_resources", resourceId: "db-prod-analytics-replica", provider: "aws", service: "RDS", region: "eu-west-1", monthlyWasteCost: 275.00, recommendation: "RDS replica db-prod-analytics-replica has received 0 read queries in the past 14 days. Consider removing this read replica.", severity: "high" },
    { scanType: "oversized_instances", resourceId: "gke-node-pool-highmem", provider: "gcp", service: "GKE", region: "us-west-2", monthlyWasteCost: 430.00, recommendation: "GKE node pool 'highmem' is running n2-highmem-16 instances but average memory utilization is only 25%. Recommend switching to n2-standard-8.", severity: "high" },
    { scanType: "orphaned_storage", resourceId: "snap-0987654321fed", provider: "aws", service: "EBS", region: "us-west-2", monthlyWasteCost: 28.80, recommendation: "EBS snapshot snap-0987654321fed is 18 months old and its source volume no longer exists. Review and delete if no longer needed.", severity: "low" },
    { scanType: "idle_resources", resourceId: "elasticache-dev-cluster", provider: "aws", service: "ElastiCache", region: "us-east-1", monthlyWasteCost: 156.00, recommendation: "ElastiCache cluster 'dev-cluster' (r6g.large, 2 nodes) has <5% cache hit rate over the past 30 days. Consider downsizing or removing.", severity: "medium" },
    { scanType: "rightsizing", resourceId: "azure-vm-sql-prod-01", provider: "azure", service: "Virtual Machines", region: "eu-west-1", monthlyWasteCost: 310.00, recommendation: "Azure VM 'sql-prod-01' (E8s_v5) uses only 35% CPU on peak. Consider migrating to E4s_v5 and saving ~$310/month.", severity: "medium" },
    { scanType: "unused_commitments", resourceId: "sp-xyz789", provider: "aws", service: "Savings Plans", region: null, monthlyWasteCost: 680.00, recommendation: "Compute Savings Plan sp-xyz789 ($2000/mo commitment) is only 66% utilized. Review workload patterns and consider adjusting future commitments.", severity: "critical" },
  ];

  for (const s of scans) {
    await prisma.wasteScanResult.create({
      data: {
        orgId: ORG_ID,
        scanType: s.scanType,
        resourceId: s.resourceId,
        provider: s.provider,
        service: s.service,
        region: s.region,
        monthlyWasteCost: decimal(s.monthlyWasteCost),
        recommendation: s.recommendation,
        severity: s.severity,
        status: pick(["open", "open", "open", "dismissed"]),
      },
    });
  }
  console.log(`  Created ${scans.length} waste scan results`);
}

async function seedCommitments() {
  console.log("Seeding commitments...");
  const now = new Date();
  const commitments = [
    { provider: "aws", commitmentType: "ri", service: "EC2", region: "us-east-1", term: "1yr", startMonthsAgo: 8, totalCost: 18000, usedCost: 14400, coveragePct: 80 },
    { provider: "aws", commitmentType: "ri", service: "RDS", region: "us-east-1", term: "1yr", startMonthsAgo: 10, totalCost: 9600, usedCost: 8640, coveragePct: 90 },
    { provider: "aws", commitmentType: "savings_plan", service: "Compute", region: null, term: "1yr", startMonthsAgo: 6, totalCost: 24000, usedCost: 15840, coveragePct: 66 },
    { provider: "aws", commitmentType: "ri", service: "ElastiCache", region: "us-west-2", term: "1yr", startMonthsAgo: 11, totalCost: 5400, usedCost: 648, coveragePct: 12 },
    { provider: "gcp", commitmentType: "cud", service: "Compute Engine", region: "us-west-2", term: "3yr", startMonthsAgo: 14, totalCost: 43200, usedCost: 36720, coveragePct: 85 },
    { provider: "gcp", commitmentType: "cud", service: "BigQuery", region: null, term: "1yr", startMonthsAgo: 3, totalCost: 7200, usedCost: 5400, coveragePct: 75 },
    { provider: "azure", commitmentType: "ri", service: "Virtual Machines", region: "eu-west-1", term: "1yr", startMonthsAgo: 9, totalCost: 14400, usedCost: 12960, coveragePct: 90 },
    { provider: "aws", commitmentType: "savings_plan", service: "EC2", region: "us-east-1", term: "3yr", startMonthsAgo: 24, totalCost: 64800, usedCost: 43200, coveragePct: 67 },
  ];

  for (const c of commitments) {
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - c.startMonthsAgo);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + (c.term === "3yr" ? 3 : 1));

    await prisma.commitment.create({
      data: {
        orgId: ORG_ID,
        provider: c.provider,
        commitmentType: c.commitmentType,
        service: c.service,
        region: c.region,
        term: c.term,
        startDate,
        endDate,
        totalCost: decimal(c.totalCost),
        usedCost: decimal(c.usedCost),
        coveragePct: decimal(c.coveragePct),
      },
    });
  }
  console.log(`  Created ${commitments.length} commitments`);
}

async function seedNotifications() {
  console.log("Seeding notifications...");
  const notifs = [
    { type: "anomaly", title: "Spending anomaly detected on AWS EC2", body: "EC2 spend in us-east-1 spiked 45% compared to the 7-day rolling average. Daily cost reached $1,245 vs expected $860.", daysAgo: 1 },
    { type: "anomaly", title: "Unusual BigQuery usage in Data Science team", body: "BigQuery costs for the Data Science team increased by 120% day-over-day, driven by a series of full-table scans on the events dataset.", daysAgo: 2 },
    { type: "budget_breach", title: "AWS monthly budget 90% consumed", body: "Your AWS monthly budget of $50,000 is 90% consumed ($45,120) with 12 days remaining. At current run rate, projected overspend is $8,400.", daysAgo: 3 },
    { type: "budget_breach", title: "AI/ML budget exceeded", body: "OpenAI + Anthropic combined spend has exceeded the monthly budget of $5,000. Current month total: $5,340. Consider reviewing usage patterns.", daysAgo: 5 },
    { type: "waste_found", title: "10 idle EC2 instances detected", body: "Waste scanner found 10 EC2 instances with <2% average CPU utilization over 30 days. Estimated monthly waste: $2,840. Review recommended.", daysAgo: 1 },
    { type: "waste_found", title: "Orphaned EBS volumes found", body: "5 unattached EBS volumes totaling 2.5TB discovered across us-east-1 and us-west-2. Estimated monthly waste: $250.", daysAgo: 4 },
    { type: "waste_found", title: "Underutilized RDS instances", body: "3 RDS instances are running at <15% CPU utilization. Combined monthly cost: $840. Consider rightsizing from db.r5.xlarge to db.r5.large.", daysAgo: 6 },
    { type: "policy_violation", title: "12 resources missing required tags", body: "Tag compliance scan found 12 resources missing the required 'team' and 'environment' tags. Affected providers: AWS (8), GCP (4).", daysAgo: 2 },
    { type: "policy_violation", title: "Untagged S3 buckets detected", body: "3 new S3 buckets were created without required cost allocation tags. Buckets: data-lake-raw-2024, ml-training-artifacts, backup-temp.", daysAgo: 7 },
    { type: "anomaly", title: "Snowflake compute spike", body: "Snowflake warehouse 'ANALYTICS_WH' auto-scaled to 3XL for 4 hours, costing $1,200. Query analysis suggests an unoptimized join in the daily ETL pipeline.", daysAgo: 3 },
    { type: "anomaly", title: "Lambda invocations 3x normal", body: "Lambda function 'process-events' invocations tripled in the last 6 hours. Estimated cost impact: $120/day vs normal $40/day.", daysAgo: 8 },
    { type: "budget_breach", title: "GCP quarterly budget at 85%", body: "GCP spend is at 85% of the quarterly budget ($42,500 of $50,000) with 6 weeks remaining. Compute Engine is the primary driver at 60% of spend.", daysAgo: 10 },
    { type: "waste_found", title: "Reserved Instance utilization low", body: "EC2 Reserved Instance ri-abc123 (r5.xlarge) has only 12% utilization. Monthly waste: $520. Consider modifying or listing on RI Marketplace.", daysAgo: 5 },
    { type: "policy_violation", title: "Non-compliant Azure resources", body: "Azure Policy audit found 5 Virtual Machines deployed outside approved regions. Resources are in 'centralus' but policy requires 'eastus' or 'westeurope'.", daysAgo: 9 },
    { type: "anomaly", title: "Anthropic API cost surge", body: "Claude 3.5 Sonnet usage increased 200% in the past 48 hours. Token consumption: 2.1M tokens vs typical 700K. Source: Data Science team's batch analysis pipeline.", daysAgo: 1 },
    { type: "waste_found", title: "GKE node pool oversized", body: "GKE node pool 'highmem' is running n2-highmem-16 instances with only 25% memory utilization. Monthly potential savings: $430 by switching to n2-standard-8.", daysAgo: 6 },
    { type: "budget_breach", title: "Datadog usage approaching limit", body: "Datadog log ingestion is at 92% of the contracted volume (18.4TB of 20TB). Overage charges of $0.10/GB will apply. Consider log filtering rules.", daysAgo: 4 },
    { type: "anomaly", title: "CloudFront data transfer anomaly", body: "CloudFront distribution d-example123 transferred 15TB in the last 24 hours, 5x the normal volume. Investigate potential hotlinking or DDoS.", daysAgo: 2 },
    { type: "waste_found", title: "Savings Plan underutilized", body: "Compute Savings Plan sp-xyz789 ($2,000/mo commitment) is only 66% utilized. Review workload distribution and consider right-sizing the next renewal.", daysAgo: 7 },
    { type: "policy_violation", title: "Public S3 bucket detected", body: "Security scan found S3 bucket 'marketing-assets-public' with public read access. This violates the organization's data security policy. Immediate review required.", daysAgo: 0 },
  ];

  for (const n of notifs) {
    await prisma.notification.create({
      data: {
        orgId: ORG_ID,
        userId: Math.random() > 0.3 ? USER_ID : null,
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.daysAgo > 5,
        createdAt: daysAgo(n.daysAgo),
      },
    });
  }
  console.log(`  Created ${notifs.length} notifications`);
}

async function seedDashboards() {
  console.log("Seeding dashboards...");
  const dashboards = [
    {
      name: "Executive Summary",
      isDefault: true,
      layout: { columns: 2, rows: 3 },
      widgets: [
        { type: "total_spend", position: { col: 0, row: 0, w: 2, h: 1 }, config: { period: "mtd", compareWith: "last_month" } },
        { type: "spend_by_provider", position: { col: 0, row: 1, w: 1, h: 1 }, config: { chartType: "donut" } },
        { type: "spend_trend", position: { col: 1, row: 1, w: 1, h: 1 }, config: { period: "90d", granularity: "daily" } },
        { type: "top_services", position: { col: 0, row: 2, w: 1, h: 1 }, config: { limit: 10 } },
        { type: "waste_summary", position: { col: 1, row: 2, w: 1, h: 1 }, config: {} },
      ],
    },
    {
      name: "Team Breakdown",
      isDefault: false,
      layout: { columns: 2, rows: 3 },
      widgets: [
        { type: "spend_by_team", position: { col: 0, row: 0, w: 2, h: 1 }, config: { chartType: "stacked_bar", period: "30d" } },
        { type: "team_trend", position: { col: 0, row: 1, w: 1, h: 1 }, config: { period: "90d" } },
        { type: "team_budget_status", position: { col: 1, row: 1, w: 1, h: 1 }, config: {} },
        { type: "environment_breakdown", position: { col: 0, row: 2, w: 1, h: 1 }, config: { chartType: "pie" } },
        { type: "region_map", position: { col: 1, row: 2, w: 1, h: 1 }, config: {} },
      ],
    },
    {
      name: "AI Costs",
      isDefault: false,
      layout: { columns: 2, rows: 3 },
      widgets: [
        { type: "ai_total_spend", position: { col: 0, row: 0, w: 2, h: 1 }, config: { providers: ["openai", "anthropic"], period: "mtd" } },
        { type: "ai_model_breakdown", position: { col: 0, row: 1, w: 1, h: 1 }, config: { chartType: "bar" } },
        { type: "ai_token_usage", position: { col: 1, row: 1, w: 1, h: 1 }, config: { period: "30d", granularity: "daily" } },
        { type: "ai_cost_per_request", position: { col: 0, row: 2, w: 1, h: 1 }, config: {} },
        { type: "ai_team_usage", position: { col: 1, row: 2, w: 1, h: 1 }, config: { chartType: "stacked_bar" } },
      ],
    },
  ];

  for (const d of dashboards) {
    await prisma.dashboard.create({
      data: {
        orgId: ORG_ID,
        name: d.name,
        isDefault: d.isDefault,
        layout: d.layout,
        widgets: d.widgets,
      },
    });
  }
  console.log(`  Created ${dashboards.length} dashboards`);
}

async function seedSpendPlans() {
  console.log("Seeding spend plans...");
  const plans = [
    {
      name: "FY2026 Cloud Budget",
      fiscalYear: 2026,
      budgets: {
        total: 720000,
        monthly: 60000,
        byProvider: { aws: 360000, gcp: 180000, azure: 108000, other: 72000 },
        byTeam: {
          "Platform Engineering": 216000,
          Product: 144000,
          "Data Science": 144000,
          Security: 108000,
          Infrastructure: 108000,
        },
        alerts: [
          { threshold: 80, channel: "email" },
          { threshold: 90, channel: "slack" },
          { threshold: 100, channel: "pagerduty" },
        ],
      },
    },
    {
      name: "FY2026 AI/ML Budget",
      fiscalYear: 2026,
      budgets: {
        total: 72000,
        monthly: 6000,
        byProvider: { openai: 36000, anthropic: 28800, other: 7200 },
        byTeam: {
          "Data Science": 36000,
          Product: 21600,
          "Platform Engineering": 14400,
        },
        alerts: [
          { threshold: 75, channel: "email" },
          { threshold: 90, channel: "slack" },
        ],
      },
    },
  ];

  for (const p of plans) {
    await prisma.spendPlan.create({
      data: {
        orgId: ORG_ID,
        name: p.name,
        fiscalYear: p.fiscalYear,
        budgets: p.budgets,
      },
    });
  }
  console.log(`  Created ${plans.length} spend plans`);
}

async function main() {
  console.log("Starting CloudDory seed...\n");

  // Clean existing seed data (preserve users, orgs, org_members, etc.)
  console.log("Cleaning existing data...");
  await prisma.policyViolation.deleteMany({});
  await prisma.labelPolicy.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.apiKey.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.bookmark.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.notification.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.commitment.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.wasteScanResult.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.savedQuery.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.spendPlan.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.dashboard.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.manualEntry.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.connector.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.costRecord.deleteMany({ where: { orgId: ORG_ID } });
  console.log("  Done\n");

  await seedCostRecords();
  await seedConnectors();
  await seedWasteScanResults();
  await seedCommitments();
  await seedNotifications();
  await seedDashboards();
  await seedSpendPlans();

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
