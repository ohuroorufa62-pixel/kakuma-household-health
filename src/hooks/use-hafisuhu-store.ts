import { useEffect, useState } from "react";
import {
  INITIAL_STATE,
  readStoredState,
  writeStoredState,
  type EducationSession,
  type HafisuhuState,
  type Household,
  type MuacScreening,
  type ReferralSlip,
} from "@/lib/hafisuhu";

export function useHafisuhuStore() {
  const [state, setState] = useState<HafisuhuState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredState(window.localStorage));
    setHydrated(true);
  }, []);

  const commit = (updater: (prev: HafisuhuState) => HafisuhuState) => {
    setState((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        writeStoredState(window.localStorage, next);
      }
      return next;
    });
  };

  return {
    ...state,
    hydrated,
    addHousehold: (household: Household) =>
      commit((prev) => ({ ...prev, households: [household, ...prev.households] })),
    toggleHouseholdHabit: (
      id: string,
      field: "safeWaterAndHandwashing" | "mosquitoNetUsage" | "timelyClinicVisits",
    ) =>
      commit((prev) => ({
        ...prev,
        households: prev.households.map((h) =>
          h.id === id
            ? { ...h, [field]: !h[field], lastVisited: new Date().toISOString().slice(0, 10) }
            : h,
        ),
      })),
    deleteHousehold: (id: string) =>
      commit((prev) => ({ ...prev, households: prev.households.filter((h) => h.id !== id) })),
    addScreening: (screening: MuacScreening) =>
      commit((prev) => ({ ...prev, screenings: [screening, ...prev.screenings] })),
    addReferral: (referral: ReferralSlip) =>
      commit((prev) => ({ ...prev, referrals: [referral, ...prev.referrals] })),
    toggleReferralStatus: (id: string) =>
      commit((prev) => ({
        ...prev,
        referrals: prev.referrals.map((r) => {
          if (r.id !== id) return r;
          if (r.status === "completed") {
            const { completedAt: _, ...rest } = r;
            return { ...rest, status: "referred" };
          }
          return { ...r, status: "completed", completedAt: new Date().toISOString().slice(0, 10) };
        }),
      })),
    deleteReferral: (id: string) =>
      commit((prev) => ({ ...prev, referrals: prev.referrals.filter((r) => r.id !== id) })),
    addSession: (session: EducationSession) =>
      commit((prev) => ({ ...prev, sessions: [session, ...prev.sessions] })),
    deleteSession: (id: string) =>
      commit((prev) => ({ ...prev, sessions: prev.sessions.filter((s) => s.id !== id) })),
  };
}