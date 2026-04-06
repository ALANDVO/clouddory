import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";

// GET: List all AI API keys (mask the actual key)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.aiApiKey.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Mask keys — only show first 8 + last 4 chars
  const masked = keys.map((k) => {
    let maskedKey = "••••••••";
    try {
      const decrypted = decrypt(k.apiKey);
      if (decrypted.length > 12) {
        maskedKey = decrypted.slice(0, 8) + "••••" + decrypted.slice(-4);
      }
    } catch { /* can't decrypt, show dots */ }

    return {
      id: k.id,
      provider: k.provider,
      label: k.label,
      maskedKey,
      isActive: k.isActive,
      lastUsed: k.lastUsed,
      errorCount: k.errorCount,
      createdAt: k.createdAt,
    };
  });

  return NextResponse.json(masked);
}

// POST: Add a new AI API key
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { provider, apiKey, label } = body;

  if (!provider || !apiKey) {
    return NextResponse.json({ error: "provider and apiKey are required" }, { status: 400 });
  }

  if (!["gemini", "openai", "anthropic", "openrouter"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const encrypted = encrypt(apiKey);

  const key = await prisma.aiApiKey.create({
    data: {
      provider,
      apiKey: encrypted,
      label: label || `${provider} key`,
      isActive: true,
    },
  });

  return NextResponse.json({ id: key.id, provider: key.provider, label: key.label }, { status: 201 });
}

// DELETE: Remove an AI API key
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.aiApiKey.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// PATCH: Toggle active status
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, isActive } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updated = await prisma.aiApiKey.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json({ id: updated.id, isActive: updated.isActive });
}
