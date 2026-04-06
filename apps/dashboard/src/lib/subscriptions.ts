export const MODULES = {
  finops: {
    name: "FinOps & Cost Optimization",
    description:
      "Cloud spend visibility, cost explorer, right-sizing recommendations, anomaly detection, savings forecasting",
    icon: "BarChart3",
    features: [
      "Multi-cloud cost explorer",
      "AI-powered recommendations",
      "Cost anomaly detection",
      "Right-sizing engine",
      "Savings forecasting",
      "Resource inventory",
    ],
    routes: ["/costs", "/resources", "/recommendations", "/anomalies"],
    included: true,
  },
  security: {
    name: "Cloud Security",
    description:
      "Security posture management, threat detection, compliance monitoring, vulnerability scanning",
    icon: "Shield",
    features: [
      "Security posture scoring",
      "Misconfiguration detection",
      "Compliance frameworks (SOC2, CIS, PCI-DSS)",
      "Real-time threat detection",
      "MITRE ATT&CK mapping",
    ],
    routes: ["/security"],
    included: true,
  },
  intelligence: {
    name: "Threat Intelligence",
    description:
      "IOC tracking, adversary profiling, threat reports, real-time intel feeds",
    icon: "Eye",
    features: [
      "IOC management & tracking",
      "Threat actor profiling",
      "Intelligence reports",
      "Real-time threat feeds",
      "TLP-based sharing",
    ],
    routes: ["/intelligence"],
    included: true,
  },
  automation: {
    name: "Security Automation (SOAR)",
    description:
      "Automated playbooks, incident response workflows, one-click remediation",
    icon: "Zap",
    features: [
      "Pre-built playbooks",
      "Custom workflow builder",
      "Auto-remediation",
      "Slack/Jira/PagerDuty integrations",
      "Execution audit trail",
    ],
    routes: ["/automation"],
    included: true,
  },
} as const;

export type ModuleKey = keyof typeof MODULES;

// In the open-source version, all modules are always accessible
export async function getOrgSubscriptions(_orgId: string) {
  return Object.keys(MODULES).map((module) => ({
    module,
    status: "active",
    plan: "self-hosted",
  }));
}

export async function hasModuleAccess(
  _orgId: string,
  _module: ModuleKey
): Promise<boolean> {
  return true;
}
