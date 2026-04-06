"use client";

import { createContext, useContext, useMemo } from "react";
import type { ModuleKey } from "@/lib/subscriptions";

interface SubscriptionContextValue {
  subscriptions: { module: string; status: string }[];
  hasAccess: (module: ModuleKey) => boolean;
  getSubscription: (module: ModuleKey) => { module: string; status: string } | undefined;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscriptions: [],
  hasAccess: () => true,
  getSubscription: () => ({ module: "finops", status: "active" }),
});

export function SubscriptionProvider({
  subscriptions: _subscriptions,
  children,
}: {
  subscriptions: unknown[];
  children: React.ReactNode;
}) {
  const value = useMemo<SubscriptionContextValue>(() => ({
    subscriptions: [],
    hasAccess: () => true, // All modules accessible in self-hosted
    getSubscription: (module: ModuleKey) => ({ module, status: "active" }),
  }), []);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  return useContext(SubscriptionContext);
}
