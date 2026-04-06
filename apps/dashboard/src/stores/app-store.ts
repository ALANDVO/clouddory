import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  currentOrgId: string | null;
  currentOrgName: string | null;
  toggleSidebar: () => void;
  setCurrentOrg: (id: string | null, name: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentOrgId: null,
  currentOrgName: null,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCurrentOrg: (id, name) =>
    set({ currentOrgId: id, currentOrgName: name }),
}));
