export interface CostRecord {
  provider: string;
  service: string;
  region: string;
  account: string;
  resourceName: string;
  resourceType: string;
  tags: Record<string, string>;
  cost: number;
}

export interface Condition {
  dimension: string;
  operator: string;
  value: string;
  logicOp: string;
}

export interface Rule {
  valueName: string;
  priority: number;
  conditions: Condition[];
}

export interface AiTagConfig {
  rules: Rule[];
  defaultValue: string;
}

export function evaluateAiTag(
  records: CostRecord[],
  config: AiTagConfig
): Record<string, { count: number; cost: number }> {
  // Sort rules by priority descending
  const sortedRules = [...config.rules].sort((a, b) => b.priority - a.priority);
  const results: Record<string, { count: number; cost: number }> = {};

  // Initialize default
  results[config.defaultValue] = { count: 0, cost: 0 };
  for (const rule of sortedRules) {
    results[rule.valueName] = { count: 0, cost: 0 };
  }

  for (const record of records) {
    let matched = false;
    for (const rule of sortedRules) {
      if (matchesRule(record, rule.conditions)) {
        results[rule.valueName].count++;
        results[rule.valueName].cost += record.cost;
        matched = true;
        break; // First match wins
      }
    }
    if (!matched) {
      results[config.defaultValue].count++;
      results[config.defaultValue].cost += record.cost;
    }
  }

  return results;
}

function matchesRule(record: CostRecord, conditions: Condition[]): boolean {
  if (conditions.length === 0) return false;

  let result = evaluateCondition(record, conditions[0]);

  for (let i = 1; i < conditions.length; i++) {
    const condResult = evaluateCondition(record, conditions[i]);
    if (conditions[i].logicOp === "OR") {
      result = result || condResult;
    } else {
      result = result && condResult;
    }
  }

  return result;
}

function evaluateCondition(record: CostRecord, condition: Condition): boolean {
  const fieldValue = getFieldValue(record, condition.dimension);
  const condValue = condition.value.toLowerCase();
  const field = fieldValue.toLowerCase();

  switch (condition.operator) {
    case "equals":
      return field === condValue;
    case "not_equals":
      return field !== condValue;
    case "contains":
      return field.includes(condValue);
    case "starts_with":
      return field.startsWith(condValue);
    case "regex":
      try {
        return new RegExp(condValue).test(field);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function getFieldValue(record: CostRecord, dimension: string): string {
  switch (dimension) {
    case "provider":
      return record.provider;
    case "service":
      return record.service;
    case "region":
      return record.region;
    case "account":
      return record.account;
    case "resource_name":
      return record.resourceName;
    case "resource_type":
      return record.resourceType;
    case "tag_key":
      return Object.keys(record.tags).join(",");
    case "tag_value":
      return Object.values(record.tags).join(",");
    default:
      return "";
  }
}
