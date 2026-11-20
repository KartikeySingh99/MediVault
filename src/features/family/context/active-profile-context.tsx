"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FamilyMemberFormValues, FamilyProfile } from "../schema";
import {
  createFamilyProfile,
  deleteFamilyProfile,
  getStoredActiveProfileId,
  listFamilyProfiles,
  renameFamilyProfile,
  setStoredActiveProfileId,
} from "../services/family-service";

interface ActiveProfileContextValue {
  profiles: FamilyProfile[];
  loading: boolean;
  activeProfile: FamilyProfile | null;
  selectProfile: (id: string) => void;
  addProfile: (input: FamilyMemberFormValues) => Promise<FamilyProfile>;
  renameProfile: (id: string, name: string) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
}

// null = used outside the provider; useActiveProfile() turns that into a clear error.
const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null);

/**
 * Holds which family profile is being viewed. This is UI state (a selected id),
 * not server data. Once Supabase is added, the profile list itself moves to TanStack Query.
 */
export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<FamilyProfile[] | null>(null); // null = still loading
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    listFamilyProfiles().then((list) => {
      const stored = getStoredActiveProfileId();
      setProfiles(list);
      setActiveId(list.some((p) => p.id === stored) ? stored : (list[0]?.id ?? null));
    });
  }, []);

  const selectProfile = useCallback((id: string) => {
    setActiveId(id);
    setStoredActiveProfileId(id);
  }, []);

  const addProfile = useCallback(
    async (input: FamilyMemberFormValues) => {
      const profile = await createFamilyProfile(input);
      setProfiles((prev) => [...(prev ?? []), profile]);
      selectProfile(profile.id);
      return profile;
    },
    [selectProfile]
  );

  const renameProfile = useCallback(async (id: string, name: string) => {
    await renameFamilyProfile(id, name);
    setProfiles((prev) => prev?.map((p) => (p.id === id ? { ...p, name } : p)) ?? null);
  }, []);

  const removeProfile = useCallback(
    async (id: string) => {
      await deleteFamilyProfile(id);
      const remaining = (profiles ?? []).filter((p) => p.id !== id);
      setProfiles(remaining);
      const self = remaining.find((p) => p.relationship === "self");
      if (id === activeId && self) selectProfile(self.id);
    },
    [profiles, activeId, selectProfile]
  );

  const value = useMemo<ActiveProfileContextValue>(
    () => ({
      profiles: profiles ?? [],
      loading: profiles === null,
      activeProfile: profiles?.find((p) => p.id === activeId) ?? null,
      selectProfile,
      addProfile,
      renameProfile,
      removeProfile,
    }),
    [profiles, activeId, selectProfile, addProfile, renameProfile, removeProfile]
  );

  return <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>;
}

export function useActiveProfile(): ActiveProfileContextValue {
  const context = useContext(ActiveProfileContext);
  if (!context) throw new Error("useActiveProfile must be used inside ActiveProfileProvider");
  return context;
}
