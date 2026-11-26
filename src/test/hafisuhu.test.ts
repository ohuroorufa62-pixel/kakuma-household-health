import { describe, expect, it } from "vitest";
import {
  INITIAL_STATE,
  classifyMuac,
  computeIndicators,
  nextSlipNumber,
  readStoredState,
  validateMuacInput,
  writeStoredState,
} from "@/lib/hafisuhu";

describe("Hafisuhu clinical rules and storage", () => {
  it("classifies MUAC measurements using WHO red/amber/green cutoffs", () => {
    expect(classifyMuac(11.4)).toEqual({
      status: "severe",
      label: "Severe Acute Malnutrition",
      referralRecommended: true,
    });
    expect(classifyMuac(11.5).status).toBe("moderate");
    expect(classifyMuac(12.4).status).toBe("moderate");
    expect(classifyMuac(12.5)).toEqual({
      status: "healthy",
      label: "Healthy Growth",
      referralRecommended: false,
    });
  });

  it("rejects empty, negative, non-numeric, and out-of-range MUAC inputs", () => {
    expect("error" in validateMuacInput("")).toBe(true);
    expect("error" in validateMuacInput("abc")).toBe(true);
    expect("error" in validateMuacInput("-4")).toBe(true);
    expect("error" in validateMuacInput("3.5")).toBe(true);
    expect("error" in validateMuacInput("35")).toBe(true);
    expect(validateMuacInput("12.34")).toEqual({ value: 12.3 });
  });

  it("computes household preventive habit and referral follow-through percentages", () => {
    const stats = computeIndicators(INITIAL_STATE.households, INITIAL_STATE.referrals);
    expect(stats.householdCount).toBe(4);
    expect(stats.washPct).toBe(75);
    expect(stats.malariaPct).toBe(75);
    expect(stats.clinicPct).toBe(75);
    expect(stats.referralCompletedCount).toBe(2);
    expect(stats.referralTotalCount).toBe(3);
    expect(stats.referralCompletedPct).toBe(67);

    const empty = computeIndicators([], []);
    expect(empty.washPct).toBe(0);
    expect(empty.referralCompletedPct).toBe(0);
  });

  it("increments duplicate referral slip numbers sequentially", () => {
    expect(nextSlipNumber(INITIAL_STATE.referrals)).toBe("HAF-2026-004");
    expect(nextSlipNumber([])).toBe("HAF-2026-001");
  });

  it("loads sample data only when unset and keeps an emptied register empty", () => {
    const backing = new Map<string, string>();
    const mockStorage = {
      getItem: (k: string) => backing.get(k) ?? null,
      setItem: (k: string, v: string) => {
        backing.set(k, v);
      },
    };

    expect(readStoredState(mockStorage).households).toHaveLength(4);

    writeStoredState(mockStorage, { households: [], screenings: [], referrals: [], sessions: [] });
    expect(readStoredState(mockStorage).households).toHaveLength(0);
  });
});