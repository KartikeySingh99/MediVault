"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createFamilyProfile,
  deleteFamilyProfile,
  getStoredActiveProfileId,
  listFamilyProfiles,
  renameFamilyProfile,
  setStoredActiveProfileId,
} from "../services/family-service";

const ActiveProfileContext = createContext(null);

/**
 * Holds which family profile is being viewed. This is UI state (a selected id),
 * not server data. Once Supabase is added, the profile list itself moves to TanStack Query.
 */
export function ActiveProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(null); // null = still loading
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    listFamilyProfiles().then((list) => {
      const stored = getStoredActiveProfileId();
      setProfiles(list);
      setActiveId(list.some((p) => p.id === stored) ? stored : list[0].id);
    });
  }, []);

  const selectProfile = useCallback((id) => {
    setActiveId(id);
    setStoredActiveProfileId(id);
  }, []);

  const addProfile = useCallback(
    async (input) => {
      const profile = await createFamilyProfile(input);
      setProfiles((prev) => [...prev, profile]);
      selectProfile(profile.id);
      return profile;
    },
    [selectProfile]
  );

  const renameProfile = useCallback(async (id, name) => {
    await renameFamilyProfile(id, name);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const removeProfile = useCallback(
    async (id) => {
      await deleteFamilyProfile(id);
      const remaining = profiles.filter((p) => p.id !== id);
      setProfiles(remaining);
      if (id === activeId) selectProfile(remaining.find((p) => p.relationship === "self").id);
    },
    [profiles, activeId, selectProfile]
  );

  const value = useMemo(
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

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) throw new Error("useActiveProfile must be used inside ActiveProfileProvider");
  return context;
}
