import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  companySize: z.enum(["solo", "startup", "mid_market", "enterprise"]).optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  billingEmail: z.string().email().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});

export const updateMemberSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

export const createCloudAccountSchema = z.object({
  provider: z.enum(["aws", "gcp", "azure"]),
  name: z.string().min(1).max(100),
  credentials: z.record(z.string(), z.string()),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(100).optional(),
});
