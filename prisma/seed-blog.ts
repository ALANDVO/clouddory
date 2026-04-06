import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
  {
    title: "Why Your Cloud Bill Is Lying to You",
    slug: "why-your-cloud-bill-is-lying-to-you",
    excerpt:
      "Your monthly cloud invoice shows a number, but that number hides a web of hidden costs, unused resources, and misallocated spend. Here is what your bill is not telling you.",
    content: `## The Illusion of a Simple Bill

Most engineering leaders glance at their AWS or GCP invoice, see a total, and move on. But that single number masks dozens of cost categories, many of which are quietly draining your budget.

## Hidden Cost #1: Idle Resources

On average, **35% of cloud spend** goes toward resources that are running but not actively serving traffic. Think about:

- Development environments left running 24/7
- Unattached EBS volumes from terminated instances
- Load balancers pointing to empty target groups
- Oversized RDS instances running at 5% CPU

## Hidden Cost #2: Data Transfer Fees

Data transfer is the silent killer of cloud budgets. Cross-AZ traffic, NAT gateway charges, and egress fees can add up to **15-20%** of your total bill without appearing as a clear line item.

## Hidden Cost #3: Commitment Waste

Reserved Instances and Savings Plans save money *when used correctly*. But many teams:

- Buy commitments for workloads that get decommissioned
- Fail to modify RIs when instance types change
- Let Savings Plans cover on-demand usage that should be spot

## What You Can Do

1. **Audit idle resources weekly** — not monthly. Monthly is too late.
2. **Tag everything** — if you cannot attribute a cost, you cannot optimize it.
3. **Monitor commitment utilization** — aim for 85%+ coverage with 95%+ utilization.
4. **Use a FinOps platform** — manual spreadsheet tracking does not scale.

The first step to fixing your cloud bill is understanding what it is actually telling you. And more importantly, what it is hiding.`,
    tags: ["FinOps", "Cloud Costs", "AWS", "Optimization"],
    authorName: "CloudDory Team",
    authorEmail: "team@clouddory.com",
    status: "published",
    publishedAt: new Date("2026-03-15"),
    coverImage: null,
  },
  {
    title: "The FinOps Maturity Model: Where Does Your Team Stand?",
    slug: "finops-maturity-model-where-does-your-team-stand",
    excerpt:
      "FinOps is not a tool you install. It is a practice you grow into. Learn about the three stages of FinOps maturity and how to level up your organization.",
    content: `## What Is FinOps Maturity?

The FinOps Foundation defines three stages of maturity: **Crawl**, **Walk**, and **Run**. Most organizations think they are further along than they actually are.

## Stage 1: Crawl

At the Crawl stage, your team is just getting started with cloud cost awareness:

- You have basic cost visibility (maybe a dashboard or two)
- Tagging is inconsistent or missing
- Cost reviews happen monthly, if at all
- Engineering and finance rarely talk about cloud spend
- No formal budgets or forecasts

**Most startups and early-stage teams are here.** That is okay. The key is recognizing it and taking the first steps.

## Stage 2: Walk

At the Walk stage, you have processes in place:

- Consistent tagging across 80%+ of resources
- Weekly cost reviews with engineering leads
- Budgets and alerts configured per team
- Some use of Reserved Instances or Savings Plans
- A designated FinOps champion or small team

**This is where real savings start.** Teams at this stage typically reduce waste by 20-30%.

## Stage 3: Run

At the Run stage, FinOps is embedded in your culture:

- Real-time cost visibility integrated into CI/CD
- Automated rightsizing and cleanup
- Engineering teams own their cloud budgets
- Commitment management is optimized and reviewed quarterly
- Cost per customer / cost per transaction metrics

**Very few organizations reach this stage**, but those that do see cloud costs as a competitive advantage.

## How to Level Up

The most important thing is not which stage you are at. It is whether you are actively moving to the next one.

- **Crawl to Walk**: Start with tagging and weekly reviews
- **Walk to Run**: Automate what you can and embed cost into engineering workflows

CloudDory is designed to meet you wherever you are and help you get to the next level.`,
    tags: ["FinOps", "Best Practices", "Cloud Strategy"],
    authorName: "CloudDory Team",
    authorEmail: "team@clouddory.com",
    status: "published",
    publishedAt: new Date("2026-03-08"),
    coverImage: null,
  },
  {
    title: "CVE Tracking for Cloud Teams: A Practical Guide",
    slug: "cve-tracking-for-cloud-teams-practical-guide",
    excerpt:
      "Thousands of CVEs are published every year. Cloud teams need a practical approach to tracking, prioritizing, and remediating the ones that actually matter.",
    content: `## The CVE Flood

In 2025, over **28,000 CVEs** were published. No team can review all of them. The challenge is not awareness; it is **prioritization**.

## Why Cloud Teams Need Their Own CVE Process

Traditional vulnerability management focuses on on-prem servers and endpoints. But cloud teams face unique challenges:

- **Container images** with hundreds of dependencies
- **Serverless functions** using third-party libraries
- **Managed services** where the cloud provider handles patching (or does not)
- **Infrastructure as Code** templates with outdated AMIs or base images

## A Practical CVE Tracking Workflow

### 1. Filter by Relevance

Not every CVE affects your stack. Start by filtering:

- By **vendor and product** (only CVEs for software you use)
- By **severity** (focus on Critical and High first)
- By **exploitability** (CISA KEV list is your best friend)

### 2. Assess Impact

For each relevant CVE, ask:

- Is the affected component deployed in production?
- Is it internet-facing?
- Are there compensating controls (WAF, network isolation)?
- Is a patch available?

### 3. Prioritize and Assign

Use a simple status workflow:

- **New** — just identified
- **Reviewing** — someone is assessing impact
- **Mitigated** — patch applied or compensating control in place
- **Not Affected** — confirmed not in your environment
- **Accepted Risk** — known but accepted with justification

### 4. Track and Report

Keep a running dashboard of:

- Open CVEs by severity
- Mean time to remediate
- Coverage gaps (components without CVE tracking)

## Tooling Recommendations

- Use **NVD and CISA KEV feeds** as your primary data sources
- Integrate CVE tracking with your **ticketing system** (Jira, ServiceNow)
- Automate **container scanning** in CI/CD pipelines
- Review the CVE dashboard in **weekly security standups**

CloudDory's Threat Intelligence module pulls from NVD and CISA KEV automatically, letting your team focus on assessment and remediation rather than data collection.`,
    tags: ["Security", "CVE", "Threat Intelligence", "Cloud Security"],
    authorName: "CloudDory Team",
    authorEmail: "team@clouddory.com",
    status: "published",
    publishedAt: new Date("2026-03-01"),
    coverImage: null,
  },
];

async function main() {
  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });
    if (existing) {
      console.log(`Skipping "${post.title}" — already exists`);
      continue;
    }
    await prisma.blogPost.create({ data: post });
    console.log(`Created: "${post.title}"`);
  }
  console.log("Blog seeding complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
