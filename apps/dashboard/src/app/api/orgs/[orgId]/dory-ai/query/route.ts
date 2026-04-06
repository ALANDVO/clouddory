import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/encryption";

// Get models in priority order from our own ai_models table
async function getModelChain(): Promise<string[]> {
  try {
    const models = await prisma.aiModel.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
      select: { modelId: true },
    });
    if (models.length > 0) return models.map((m) => m.modelId);
  } catch { /* fall through */ }
  return ["gemini-2.5-flash", "gemini-2.0-flash"];
}

// Get a random active API key from our own ai_api_keys table, decrypted
async function getRandomKey(provider: string): Promise<string | null> {
  try {
    const keys = await prisma.aiApiKey.findMany({
      where: { provider, isActive: true },
    });
    if (keys.length > 0) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      // Update last used timestamp
      await prisma.aiApiKey.update({
        where: { id: key.id },
        data: { lastUsed: new Date() },
      }).catch(() => {});
      try {
        return decrypt(key.apiKey);
      } catch {
        // If decryption fails, try using the key as-is (might be stored unencrypted)
        return key.apiKey;
      }
    }
  } catch { /* fall through */ }

  // Fallback to env vars
  const envMap: Record<string, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  };
  return envMap[provider] || null;
}

// Mark a key as having an error
async function markKeyError(provider: string, apiKey: string) {
  try {
    // Find the key by provider and increment error count
    const keys = await prisma.aiApiKey.findMany({
      where: { provider, isActive: true },
    });
    for (const key of keys) {
      try {
        const decrypted = decrypt(key.apiKey);
        if (decrypted === apiKey) {
          await prisma.aiApiKey.update({
            where: { id: key.id },
            data: { errorCount: { increment: 1 } },
          });
          break;
        }
      } catch { /* skip */ }
    }
  } catch { /* ignore */ }
}

// Try models in priority order with key rotation — fall back on error/rate limit
async function callGemini(prompt: string): Promise<string> {
  const models = await getModelChain();

  // Gather all available Gemini keys
  const dbKeys = await prisma.aiApiKey.findMany({
    where: { provider: "gemini", isActive: true },
  }).catch(() => []);

  const apiKeys: string[] = [];
  for (const k of dbKeys) {
    try {
      apiKeys.push(decrypt(k.apiKey));
    } catch {
      apiKeys.push(k.apiKey);
    }
  }
  if (apiKeys.length === 0 && process.env.GEMINI_API_KEY) {
    apiKeys.push(process.env.GEMINI_API_KEY);
  }

  if (apiKeys.length === 0) return "AI is not configured. Add API keys in Settings > AI Config.";

  for (const model of models) {
    for (const apiKey of apiKeys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 0.9 },
          }),
        });

        if (res.status === 429) {
          console.log(`Rate limited on ${model} with key ...${apiKey.slice(-6)}, trying next`);
          continue;
        }

        if (!res.ok) {
          console.log(`Error ${res.status} on ${model}, trying next`);
          await markKeyError("gemini", apiKey);
          continue;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`DoryAI used model: ${model}`);
          return text;
        }
      } catch (err) {
        console.log(`Fetch error on ${model}, trying next:`, err);
        continue;
      }
    }
  }

  return "Sorry, all AI models are currently unavailable. Please try again in a moment.";
}

function fmtUsd(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { orgId } = await params;

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const question: string = body.question ?? "";
  const currentPage: string = body.currentPage ?? "/dashboard";
  if (!question.trim()) return NextResponse.json({ error: "Question is required" }, { status: 400 });

  try {
    // Gather the user's real data context
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Page context descriptions
    const PAGE_CONTEXT: Record<string, string> = {
      '/dashboard': 'The user is on the main Dashboard overview page.',
      '/costs': 'The user is on the Cost Explorer page — they can see spend charts, filters, and service breakdowns.',
      '/resources': 'The user is on the Resource Inventory page — listing all cloud services and their costs.',
      '/anomalies': 'The user is on the Anomalies page — showing cost spike detection.',
      '/costs/allocation': 'The user is on the Shared Cost Allocation page — for splitting shared costs across teams.',
      '/costs/aitags': 'The user is on the AiTags page — for creating virtual cost dimensions and tag rules.',
      '/recommendations': 'The user is on the Waste Scanner page — showing idle resources, rightsizing opportunities, etc.',
      '/commitments': 'The user is on the Commitments page — tracking Reserved Instances and Savings Plans.',
      '/ai-costs': 'The user is on the AI Costs page — tracking OpenAI, Anthropic, and other AI provider costs.',
      '/security': 'The user is on the Security Overview page — showing CVE/vulnerability tracking, security posture, and threat detection. This is the CSPM module.',
      '/security/detections': 'The user is on the CVE Detections page — a list of all known vulnerabilities from NVD and CISA KEV with severity scores.',
      '/security/posture': 'The user is on the Security Posture page — showing overall security score, patch coverage, and vulnerability age.',
      '/intelligence': 'The user is on the Threat Intelligence page — for IOC tracking and threat feeds.',
      '/integrations': 'The user is on the Integrations page — connecting cloud providers, SaaS tools, and AI services.',
      '/settings/cloud-accounts': 'The user is on Cloud Accounts settings — managing connected AWS/GCP/Azure accounts.',
      '/dashboards': 'The user is on the Custom Dashboards page — creating and viewing custom dashboard widgets.',
      '/query-lens': 'The user is on the Query Builder page — building ad-hoc cost reports.',
      '/spend-plan': 'The user is on the Spend Plan page — financial planning with budgets.',
      '/reports': 'The user is on the Scheduled Reports page.',
      '/label-policy': 'The user is on the Tag Governance page — enforcing tagging policies.',
      '/ai': 'The user is on the DoryAI full chat page.',
    };

    const pageContext = PAGE_CONTEXT[currentPage] || `The user is on the ${currentPage} page.`;

    const [
      totalSpend,
      serviceBreakdown,
      providerBreakdown,
      regionBreakdown,
      wasteResults,
      anomalies,
      cloudAccounts,
      recentRecords,
    ] = await Promise.all([
      // Total spend this month
      prisma.costRecord.aggregate({
        where: { orgId, date: { gte: thisMonthStart } },
        _sum: { cost: true },
        _count: true,
      }),
      // Spend by service (top 10)
      prisma.costRecord.groupBy({
        by: ["service"],
        where: { orgId, date: { gte: thirtyDaysAgo } },
        _sum: { cost: true },
        orderBy: { _sum: { cost: "desc" } },
        take: 10,
      }),
      // Spend by provider
      prisma.costRecord.groupBy({
        by: ["source"],
        where: { orgId, date: { gte: thirtyDaysAgo } },
        _sum: { cost: true },
        orderBy: { _sum: { cost: "desc" } },
      }),
      // Spend by region
      prisma.costRecord.groupBy({
        by: ["region"],
        where: { orgId, date: { gte: thirtyDaysAgo }, region: { not: null } },
        _sum: { cost: true },
        orderBy: { _sum: { cost: "desc" } },
        take: 5,
      }),
      // Open waste/savings opportunities
      prisma.wasteScanResult.findMany({
        where: { orgId, status: "open" },
        orderBy: { monthlyWasteCost: "desc" },
        take: 10,
      }),
      // Recent anomalies
      prisma.anomaly.findMany({
        where: { orgId, status: { in: ["open", "acknowledged"] } },
        orderBy: { detectedAt: "desc" },
        take: 5,
      }),
      // Connected cloud accounts
      prisma.cloudAccount.findMany({
        where: { orgId },
        select: { provider: true, name: true, status: true, lastSyncAt: true },
      }),
      // Sample of recent records for context
      prisma.costRecord.findMany({
        where: { orgId, date: { gte: thirtyDaysAgo } },
        orderBy: { cost: "desc" },
        take: 20,
        select: { service: true, source: true, region: true, cost: true, date: true, team: true, environment: true },
      }),
    ]);

    // Fetch CVE data if on security pages
    let cveContext = "";
    if (currentPage.startsWith("/security") || question.toLowerCase().includes("cve") || question.toLowerCase().includes("security") || question.toLowerCase().includes("vulnerab")) {
      try {
        const [cveCounts, recentCritical] = await Promise.all([
          prisma.cveCatalog.groupBy({ by: ["severity"], _count: true }),
          prisma.cveCatalog.findMany({
            where: { severity: { in: ["critical", "high"] } },
            orderBy: { published: "desc" },
            take: 10,
            select: { cveId: true, severity: true, title: true, vendor: true, cisaKev: true, cvssScore: true, exploitAvailable: true, patchAvailable: true },
          }),
        ]);

        const orgTracking = await prisma.orgCveTracking.findMany({
          where: { orgId },
          select: { cveId: true, status: true },
        });

        const severityCounts = Object.fromEntries(cveCounts.map((c) => [c.severity, c._count]));
        const mitigated = orgTracking.filter((t) => t.status === "mitigated").length;

        cveContext = `
CVE/VULNERABILITY DATA:
  Total CVEs in catalog: ${cveCounts.reduce((s, c) => s + c._count, 0)}
  Critical: ${severityCounts.critical || 0}, High: ${severityCounts.high || 0}, Medium: ${severityCounts.medium || 0}, Low: ${severityCounts.low || 0}
  CISA KEV (actively exploited): ${recentCritical.filter((c) => c.cisaKev).length} in top 10
  Your org has mitigated: ${mitigated} CVEs

  Recent Critical/High CVEs:
${recentCritical.map((c) => `  - ${c.cveId} (${c.severity.toUpperCase()}, CVSS ${c.cvssScore || "?"}): ${c.title}${c.cisaKev ? " [CISA KEV - ACTIVELY EXPLOITED]" : ""}${c.exploitAvailable ? " [Exploit Available]" : ""}${c.patchAvailable ? " [Patch Available]" : ""}`).join("\n")}
`;
      } catch { /* CVE data optional */ }
    }

    // Build context string
    const totalCost = totalSpend._sum.cost?.toNumber() ?? 0;
    const recordCount = totalSpend._count;

    const serviceList = serviceBreakdown
      .map((s) => `  - ${s.service}: ${fmtUsd(s._sum.cost?.toNumber() ?? 0)}`)
      .join("\n");

    const providerList = providerBreakdown
      .map((p) => `  - ${p.source || "unknown"}: ${fmtUsd(p._sum.cost?.toNumber() ?? 0)}`)
      .join("\n");

    const regionList = regionBreakdown
      .map((r) => `  - ${r.region}: ${fmtUsd(r._sum.cost?.toNumber() ?? 0)}`)
      .join("\n");

    const wasteList = wasteResults.length > 0
      ? wasteResults.map((w) => `  - ${w.scanType}: ${w.resourceId} (${w.service}) — save ${fmtUsd(w.monthlyWasteCost?.toNumber() ?? 0)}/mo — ${w.recommendation}`).join("\n")
      : "  No open savings opportunities found.";

    const anomalyList = anomalies.length > 0
      ? anomalies.map((a) => `  - ${a.service} (${a.provider}): expected ${fmtUsd(a.expectedCost.toNumber())}, actual ${fmtUsd(a.actualCost.toNumber())}, ${a.deviationPct}% deviation, severity: ${a.severity}`).join("\n")
      : "  No active anomalies.";

    const accountList = cloudAccounts.length > 0
      ? cloudAccounts.map((a) => `  - ${a.provider} "${a.name}": ${a.status}, last sync: ${a.lastSyncAt?.toISOString().slice(0, 10) || "never"}`).join("\n")
      : "  No cloud accounts connected.";

    const prompt = `You are DoryAI, the intelligent assistant for CloudDory — a unified cloud operations platform covering FinOps (cost optimization), Cloud Security (CSPM/CVE tracking), Threat Intelligence, and SOAR (automated response).

CURRENT PAGE CONTEXT:
${pageContext}
When the user asks "what is this page" or "what am I looking at", describe the specific page they're on and its features. Be specific about CloudDory's capabilities on that page.

Here is the user's current cloud cost data:

MONTHLY SPEND (this month): ${fmtUsd(totalCost)} across ${recordCount} cost records

CONNECTED CLOUD ACCOUNTS:
${accountList}

TOP SERVICES BY COST (last 30 days):
${serviceList || "  No service data available."}

SPEND BY PROVIDER (last 30 days):
${providerList || "  No provider data available."}

SPEND BY REGION (last 30 days):
${regionList || "  No region data available."}

SAVINGS OPPORTUNITIES (open):
${wasteList}

ACTIVE ANOMALIES:
${anomalyList}
${cveContext}
---

The user is currently on: ${currentPage}
The user asks: "${question}"

Rules for your response:
1. Answer the question directly — do NOT greet the user or say "Hello". Jump straight into the answer.
2. **If the user asks "what is this page" or similar**, describe the SPECIFIC page they're on based on the CURRENT PAGE CONTEXT above. Explain what features are available and how to use them. Do NOT default to talking about costs if they're on a security/intelligence page.
3. Be concise but thorough. Use markdown: **bold** for key numbers, bullet points (with *) for lists.
4. Reference their actual data above — don't make up numbers.
5. If on a security page, talk about CVEs, vulnerabilities, CISA KEV, patches — not costs.
6. If on a cost page, talk about spend, services, savings — not security.
7. Keep responses under 300 words unless the question requires more detail.
8. Use line breaks between sections for readability.`;

    const answer = await callGemini(prompt);

    // Also return structured data for the side panel
    const topServices = serviceBreakdown.map((s) => ({
      service: s.service,
      cost: s._sum.cost?.toNumber() ?? 0,
    }));

    return NextResponse.json({
      answer,
      data: {
        type: "table",
        rows: topServices,
      },
    });
  } catch (err) {
    console.error("DoryAI query error:", err);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
