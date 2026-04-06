import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

// Assume role in customer's account
export async function assumeCustomerRole(
  roleArn: string,
  externalId: string
) {
  const sts = new STSClient({ region: "us-east-1" });
  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: "CloudDorySession",
    ExternalId: externalId,
    DurationSeconds: 3600,
  });
  return sts.send(command);
}

// Get cost data using assumed credentials
export async function getCostAndUsage(
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  },
  startDate: string,
  endDate: string,
  granularity: "DAILY" | "MONTHLY" = "DAILY",
  groupBy?: { type: string; key: string }[]
) {
  const client = new CostExplorerClient({
    region: "us-east-1",
    credentials,
  });

  const command = new GetCostAndUsageCommand({
    TimePeriod: { Start: startDate, End: endDate },
    Granularity: granularity,
    Metrics: ["UnblendedCost", "UsageQuantity"],
    GroupBy: groupBy?.map((g) => ({
      Type: g.type as "DIMENSION" | "TAG",
      Key: g.key,
    })),
  });

  return client.send(command);
}

// Verify a connection works
export async function verifyAwsConnection(
  roleArn: string,
  externalId: string
) {
  try {
    const assumeResult = await assumeCustomerRole(roleArn, externalId);
    const creds = assumeResult.Credentials!;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    // If start and end are the same (1st of month), adjust start to previous month
    const effectiveStart =
      startDate === endDate
        ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
            .toISOString()
            .split("T")[0]
        : startDate;

    const costResult = await getCostAndUsage(
      {
        accessKeyId: creds.AccessKeyId!,
        secretAccessKey: creds.SecretAccessKey!,
        sessionToken: creds.SessionToken!,
      },
      effectiveStart,
      endDate,
      "MONTHLY"
    );

    const totalCost =
      costResult.ResultsByTime?.[0]?.Total?.UnblendedCost?.Amount || "0";

    return {
      success: true,
      accountId: assumeResult.AssumedRoleUser?.Arn?.split(":")[4],
      currentMonthCost: parseFloat(totalCost),
      message: "Successfully connected to AWS",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to connect",
      code: error.Code || error.name,
    };
  }
}
