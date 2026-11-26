export type PriorityGroup = "Pregnant woman" | "Children under 5" | "Elderly resident";
export type MuacStatus = "severe" | "moderate" | "healthy";
export type EducationTopic =
  | "Maternal & Child Health"
  | "Water & Sanitation (WASH)"
  | "Nutrition"
  | "Malaria Prevention"
  | "Mental Well-Being";

export interface Household {
  id: string;
  headName: string;
  zone: string;
  members: number;
  priorityGroups: PriorityGroup[];
  safeWaterAndHandwashing: boolean;
  mosquitoNetUsage: boolean;
  timelyClinicVisits: boolean;
  lastVisited: string;
}

export interface MuacScreening {
  id: string;
  householdId: string;
  householdHead: string;
  childName: string;
  ageMonths: number;
  muacCm: number;
  status: MuacStatus;
  screenedAt: string;
}

export interface ReferralSlip {
  id: string;
  slipNumber: string;
  householdHead: string;
  patientName: string;
  reason: string;
  clinic: string;
  promoterName: string;
  issuedAt: string;
  status: "referred" | "completed";
  completedAt?: string;
}

export interface EducationSession {
  id: string;
  date: string;
  zone: string;
  format: "Household visit" | "Neighborhood health circle";
  language: "Turkana" | "Swahili" | "English";
  topics: EducationTopic[];
  householdsReached: number;
  notes: string;
}

export interface HafisuhuState {
  households: Household[];
  screenings: MuacScreening[];
  referrals: ReferralSlip[];
  sessions: EducationSession[];
}

export const EDUCATION_TOPICS: EducationTopic[] = [
  "Maternal & Child Health",
  "Water & Sanitation (WASH)",
  "Nutrition",
  "Malaria Prevention",
  "Mental Well-Being",
];

export const PRIORITY_GROUPS: PriorityGroup[] = [
  "Pregnant woman",
  "Children under 5",
  "Elderly resident",
];

export const LOCAL_CLINICS = [
  "Kakuma Sub-County Hospital",
  "Lopiding Health Centre",
  "Kalobeyei Integrated Clinic",
  "Kakuma Mission Hospital",
] as const;

export const PILOT_FINDINGS = [
  { id: "wash", label: "Safe Water & Handwashing Practice", baseline: 42, endline: 84, change: "+42%" },
  { id: "malaria", label: "Consistent Mosquito Net Usage", baseline: 51, endline: 88, change: "+37%" },
  { id: "clinic", label: "Timely Antenatal / Child Clinic Visits", baseline: 48, endline: 81, change: "+33%" },
  { id: "referrals", label: "Completed Clinic Referrals", baseline: null, endline: 76, change: "High follow-through" },
] as const;

export const STORAGE_KEY = "hafisuhu_field_state_v1";

export function classifyMuac(cm: number): { status: MuacStatus; label: string; referralRecommended: boolean } {
  if (cm < 11.5) return { status: "severe", label: "Severe Acute Malnutrition", referralRecommended: true };
  if (cm < 12.5) return { status: "moderate", label: "Moderate Acute Malnutrition", referralRecommended: true };
  return { status: "healthy", label: "Healthy Growth", referralRecommended: false };
}

export function validateMuacInput(raw: string): { value: number } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Enter a MUAC measurement in cm." };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return { error: "Enter a valid positive number." };
  if (parsed < 5 || parsed > 30) return { error: "MUAC must be between 5.0 and 30.0 cm." };
  return { value: Math.round(parsed * 10) / 10 };
}

export function validatePositiveInt(raw: string, label: string, max: number): { value: number } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: `Enter ${label}.` };
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    return { error: `${label} must be a whole number between 1 and ${max}.` };
  }
  return { value: parsed };
}

export function computeIndicators(households: Household[], referrals: ReferralSlip[]) {
  const hTotal = households.length;
  const rTotal = referrals.length;
  const pct = (count: number, total: number) => (total === 0 ? 0 : Math.round((count / total) * 100));
  return {
    householdCount: hTotal,
    washPct: pct(households.filter((h) => h.safeWaterAndHandwashing).length, hTotal),
    malariaPct: pct(households.filter((h) => h.mosquitoNetUsage).length, hTotal),
    clinicPct: pct(households.filter((h) => h.timelyClinicVisits).length, hTotal),
    referralCompletedPct: pct(referrals.filter((r) => r.status === "completed").length, rTotal),
    referralCompletedCount: referrals.filter((r) => r.status === "completed").length,
    referralTotalCount: rTotal,
  };
}

export function nextSlipNumber(referrals: ReferralSlip[]): string {
  const maxNum = referrals.reduce((acc, slip) => {
    const match = slip.slipNumber.match(/(\d+)$/);
    return Math.max(acc, match?.[1] ? Number(match[1]) : 0);
  }, 0);
  return `HAF-2026-${String(maxNum + 1).padStart(3, "0")}`;
}

export const INITIAL_STATE: HafisuhuState = {
  households: [
    { id: "hh-1", headName: "Amina Lokiru", zone: "Kakuma 1 · Block 4", members: 6, priorityGroups: ["Pregnant woman", "Children under 5"], safeWaterAndHandwashing: true, mosquitoNetUsage: true, timelyClinicVisits: true, lastVisited: "2026-11-24" },
    { id: "hh-2", headName: "Ekal Peter", zone: "Kakuma 2 · Phase 2", members: 5, priorityGroups: ["Children under 5"], safeWaterAndHandwashing: true, mosquitoNetUsage: true, timelyClinicVisits: false, lastVisited: "2026-11-22" },
    { id: "hh-3", headName: "Grace Nakiru", zone: "Kakuma 3 · Zone 3", members: 7, priorityGroups: ["Pregnant woman", "Elderly resident"], safeWaterAndHandwashing: false, mosquitoNetUsage: true, timelyClinicVisits: true, lastVisited: "2026-11-21" },
    { id: "hh-4", headName: "Joseph Lobuin", zone: "Kalobeyei · Village 1", members: 4, priorityGroups: ["Children under 5", "Elderly resident"], safeWaterAndHandwashing: true, mosquitoNetUsage: false, timelyClinicVisits: true, lastVisited: "2026-11-19" },
  ],
  screenings: [
    { id: "sc-1", householdId: "hh-1", householdHead: "Amina Lokiru", childName: "Lomuria Amina", ageMonths: 22, muacCm: 13.1, status: "healthy", screenedAt: "2026-11-24" },
    { id: "sc-2", householdId: "hh-2", householdHead: "Ekal Peter", childName: "Ewoi Ekal", ageMonths: 16, muacCm: 11.9, status: "moderate", screenedAt: "2026-11-22" },
    { id: "sc-3", householdId: "hh-4", householdHead: "Joseph Lobuin", childName: "Akiro Lobuin", ageMonths: 11, muacCm: 11.2, status: "severe", screenedAt: "2026-11-19" },
  ],
  referrals: [
    { id: "rf-1", slipNumber: "HAF-2026-001", householdHead: "Joseph Lobuin", patientName: "Akiro Lobuin", reason: "MUAC 11.2 cm — Severe Acute Malnutrition", clinic: "Kalobeyei Integrated Clinic", promoterName: "Mary Akiru", issuedAt: "2026-11-19", status: "completed", completedAt: "2026-11-20" },
    { id: "rf-2", slipNumber: "HAF-2026-002", householdHead: "Grace Nakiru", patientName: "Grace Nakiru", reason: "Third-trimester antenatal check & iron review", clinic: "Kakuma Sub-County Hospital", promoterName: "Samuel Emuria", issuedAt: "2026-11-21", status: "completed", completedAt: "2026-11-22" },
    { id: "rf-3", slipNumber: "HAF-2026-003", householdHead: "Ekal Peter", patientName: "Ewoi Ekal", reason: "MUAC 11.9 cm — Supplementary feeding review", clinic: "Lopiding Health Centre", promoterName: "Mary Akiru", issuedAt: "2026-11-22", status: "referred" },
  ],
  sessions: [
    { id: "ed-1", date: "2026-11-24", zone: "Kakuma 1 · Block 4", format: "Neighborhood health circle", language: "Turkana", topics: ["Water & Sanitation (WASH)", "Malaria Prevention"], householdsReached: 14, notes: "Demonstrated tippy-tap handwashing stations and net repair." },
    { id: "ed-2", date: "2026-11-21", zone: "Kakuma 3 · Zone 3", format: "Household visit", language: "Swahili", topics: ["Maternal & Child Health", "Nutrition"], householdsReached: 4, notes: "Reviewed clinic danger signs and local iron-rich foods." },
    { id: "ed-3", date: "2026-11-18", zone: "Kalobeyei · Village 1", format: "Neighborhood health circle", language: "Turkana", topics: ["Mental Well-Being", "Water & Sanitation (WASH)"], householdsReached: 11, notes: "Caregiver peer support check-in and safe water storage." },
  ],
};

export function readStoredState(storage: Pick<Storage, "getItem">): HafisuhuState {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<HafisuhuState>;
    return {
      households: Array.isArray(parsed.households) ? parsed.households : [],
      screenings: Array.isArray(parsed.screenings) ? parsed.screenings : [],
      referrals: Array.isArray(parsed.referrals) ? parsed.referrals : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function writeStoredState(storage: Pick<Storage, "setItem">, state: HafisuhuState): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}