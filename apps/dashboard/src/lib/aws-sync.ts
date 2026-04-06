import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { assumeCustomerRole, getCostAndUsage } from "@/lib/aws-client";
import { Decimal } from "@prisma/client/runtime/library";

export interface SyncResult {
  success: boolean;
  recordsUpserted: number;
  dateRange: { start: string; end: string };
  totalCost: number;
  error?: string;
}

export async function syncAwsCosts(
  cloudAccountId: string
): Promise<SyncResult> {
  // 1. Get cloud account from DB
  const account = await prisma.cloudAccount.findUnique({
    where: { id: cloudAccountId },
  });

  if (!account) {
    return {
      success: false,
      recordsUpserted: 0,
      dateRange: { start: "", end: "" },
      totalCost: 0,
      error: "Cloud account not found",
    };
  }

  if (!account.credentialsEnc) {
    return {
      success: false,
      recordsUpserted: 0,
      dateRange: { start: "", end: "" },
      totalCost: 0,
      error: "No credentials stored",
    };
  }

  // 2. Decrypt credentials
  let credentials: { roleArn: string; externalId: string };
  try {
    credentials = JSON.parse(decrypt(account.credentialsEnc));
  } catch {
    return {
      success: false,
      recordsUpserted: 0,
      dateRange: { start: "", end: "" },
      totalCost: 0,
      error: "Failed to decrypt credentials",
    };
  }

  try {
    // 3. Assume role
    const assumeResult = await assumeCustomerRole(
      credentials.roleArn,
      credentials.externalId
    );
    const creds = assumeResult.Credentials!;
    const tempCredentials = {
      accessKeyId: creds.AccessKeyId!,
      secretAccessKey: creds.SecretAccessKey!,
      sessionToken: creds.SessionToken!,
    };

    // 4. Pull last 90 days of daily cost data grouped by SERVICE
    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    const startDateObj = new Date(now);
    startDateObj.setDate(startDateObj.getDate() - 90);
    const startDate = startDateObj.toISOString().split("T")[0];

    // Pull daily costs grouped by SERVICE + USAGE_TYPE for granular detail
    const costResult = await getCostAndUsage(
      tempCredentials,
      startDate,
      endDate,
      "DAILY",
      [
        { type: "DIMENSION", key: "SERVICE" },
        { type: "DIMENSION", key: "USAGE_TYPE" },
      ]
    );

    // 5. For each day/service combo, upsert into cost_records
    let recordsUpserted = 0;
    let totalCost = 0;

    const upsertPromises: Promise<any>[] = [];

    for (const timePeriod of costResult.ResultsByTime || []) {
      const periodStart = timePeriod.TimePeriod?.Start;
      if (!periodStart) continue;

      const dateObj = new Date(periodStart + "T00:00:00Z");

      for (const group of timePeriod.Groups || []) {
        const serviceName = group.Keys?.[0] || "Unknown";
        const usageType = group.Keys?.[1] || null;
        const costAmount = parseFloat(
          group.Metrics?.UnblendedCost?.Amount || "0"
        );
        const usageAmount = parseFloat(
          group.Metrics?.UsageQuantity?.Amount || "0"
        );

        if (costAmount === 0 && usageAmount === 0) continue;

        totalCost += costAmount;

        upsertPromises.push(
          (async () => {
            const existing = await prisma.costRecord.findFirst({
              where: {
                cloudAccountId: account.id,
                date: dateObj,
                service: serviceName,
                resourceType: usageType,
              },
            });

            const data = {
              cost: new Decimal(costAmount.toFixed(4)),
              usage: usageAmount > 0 ? new Decimal(usageAmount.toFixed(4)) : null,
              resourceType: usageType,
              source: "aws",
              region: "global",
            };

            if (existing) {
              await prisma.costRecord.update({
                where: { id: existing.id },
                data,
              });
            } else {
              await prisma.costRecord.create({
                data: {
                  orgId: account.orgId,
                  cloudAccountId: account.id,
                  date: dateObj,
                  service: serviceName,
                  currency: "USD",
                  ...data,
                },
              });
            }
            recordsUpserted++;
          })()
        );
      }
    }

    // Process in batches of 20 to avoid overwhelming the DB
    const batchSize = 20;
    for (let i = 0; i < upsertPromises.length; i += batchSize) {
      await Promise.all(upsertPromises.slice(i, i + batchSize));
    }

    // 6. Update cloud_account.lastSyncAt
    await prisma.cloudAccount.update({
      where: { id: cloudAccountId },
      data: {
        lastSyncAt: new Date(),
        status: "active",
        lastError: null,
      },
    });

    return {
      success: true,
      recordsUpserted,
      dateRange: { start: startDate, end: endDate },
      totalCost: Math.round(totalCost * 100) / 100,
    };
  } catch (error: any) {
    // Update account with error status
    await prisma.cloudAccount.update({
      where: { id: cloudAccountId },
      data: {
        status: "error",
        lastError: error.message || "Sync failed",
      },
    });

    return {
      success: false,
      recordsUpserted: 0,
      dateRange: { start: "", end: "" },
      totalCost: 0,
      error: error.message || "Sync failed",
    };
  }
}
