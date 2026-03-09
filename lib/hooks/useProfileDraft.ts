"use client";

import { useEffect, useState } from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import { makeDefaultProfile } from "@/lib/domain/profile/defaults";
import {
  loadProfileDraft,
  saveProfileDraft,
} from "@/lib/services/storage/profileStorage";

export function useProfileDraft() {
  const [profile, setProfile] = useState<BaseProfile>(() => makeDefaultProfile());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const draft = loadProfileDraft();
    if (draft) {
      setProfile(draft);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProfileDraft(profile);
  }, [profile, hydrated]);

  return {
    profile,
    setProfile,
    hydrated,
  };
}