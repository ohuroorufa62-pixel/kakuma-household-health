import { useState } from "react";
import { CheckCircle2, ClipboardCheck, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LOCAL_CLINICS,
  classifyMuac,
  nextSlipNumber,
  validateMuacInput,
  validatePositiveInt,
  type Household,
  type MuacScreening,
  type ReferralSlip,
} from "@/lib/hafisuhu";

interface ScreeningReferralsPanelProps {
  households: Household[];
  screenings: MuacScreening[];
  referrals: ReferralSlip[];
  onAddScreening: (screening: MuacScreening) => void;
  onAddReferral: (referral: ReferralSlip) => void;
  onToggleReferralStatus: (id: string) => void;
  onDeleteReferral: (id: string) => void;
}

export function ScreeningReferralsPanel({
  households,
  screenings,
  referrals,
  onAddScreening,
  onAddReferral,
  onToggleReferralStatus,
  onDeleteReferral,
}: ScreeningReferralsPanelProps) {
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(households[0]?.id ?? "");
  const [childName, setChildName] = useState("");
  const [ageMonths, setAgeMonths] = useState("18");
  const [muacInput, setMuacInput] = useState("12.6");
  const [muacError, setMuacError] = useState<string | null>(null);

  const [patientName, setPatientName] = useState("");
  const [householdHead, setHouseholdHead] = useState(households[0]?.headName ?? "");
  const [reason, setReason] = useState("");
  const [clinic, setClinic] = useState<string>(LOCAL_CLINICS[0]);
  const [promoterName, setPromoterName] = useState("Mary Akiru");
  const [refError, setRefError] = useState<string | null>(null);

  const liveMuacCheck = validateMuacInput(muacInput);
  const liveClassification = "value" in liveMuacCheck ? classifyMuac(liveMuacCheck.value) : null;

  const handleScreeningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hh = households.find((h) => h.id === selectedHouseholdId);
    if (!childName.trim()) {
      setMuacError("Enter the child's name.");
      return;
    }
    const ageCheck = validatePositiveInt(ageMonths, "Child age (months)", 59);
    if ("error" in ageCheck) {
      setMuacError(ageCheck.error);
      return;
    }
    const muacCheck = validateMuacInput(muacInput);
    if ("error" in muacCheck) {
      setMuacError(muacCheck.error);
      return;
    }
    const result = classifyMuac(muacCheck.value);
    onAddScreening({
      id: `sc-${Date.now()}`,
      householdId: hh?.id ?? "walk-in",
      householdHead: hh?.headName ?? "Unregistered Household",
      childName: childName.trim(),
      ageMonths: ageCheck.value,
      muacCm: muacCheck.value,
      status: result.status,
      screenedAt: new Date().toISOString().slice(0, 10),
    });
    if (result.referralRecommended) {
      setPatientName(childName.trim());
      setHouseholdHead(hh?.headName ?? "");
      setReason(`MUAC ${muacCheck.value} cm — ${result.label}`);
      toast.warning(`${childName.trim()} flagged for ${result.label}. Referral slip pre-filled.`);
    } else {
      toast.success(`MUAC check logged for ${childName.trim()}.`);
    }
    setChildName("");
    setMuacError(null);
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !reason.trim() || !promoterName.trim()) {
      setRefError("Enter patient name, referral reason, and community health promoter.");
      return;
    }
    const slipNumber = nextSlipNumber(referrals);
    onAddReferral({
      id: `rf-${Date.now()}`,
      slipNumber,
      householdHead: householdHead.trim() || patientName.trim(),
      patientName: patientName.trim(),
      reason: reason.trim(),
      clinic,
      promoterName: promoterName.trim(),
      issuedAt: new Date().toISOString().slice(0, 10),
      status: "referred",
    });
    setPatientName("");
    setReason("");
    setRefError(null);
    toast.success(`Duplicate referral slip ${slipNumber} issued.`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-lg">Child Nutrition Screening (MUAC)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Measure Mid-Upper Arm Circumference for children under 5 (6–59 months).
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleScreeningSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="muac-hh">Household</Label>
              <Select value={selectedHouseholdId} onValueChange={setSelectedHouseholdId}>
                <SelectTrigger id="muac-hh">
                  <SelectValue placeholder="Select household" />
                </SelectTrigger>
                <SelectContent>
                  {households.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.headName} ({h.zone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="muac-child">Child Name</Label>
                <Input id="muac-child" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="e.g., Nakiru Ekal" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="muac-age">Age (months)</Label>
                <Input id="muac-age" type="number" min={1} max={59} value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="muac-cm">MUAC Tape Reading (cm)</Label>
              <div className="flex items-center gap-3">
                <Input id="muac-cm" type="number" step="0.1" min={5} max={30} value={muacInput} onChange={(e) => setMuacInput(e.target.value)} className="tabular-mono max-w-32" />
                {liveClassification && (
                  <Badge variant={liveClassification.status}>{liveClassification.label}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Red &lt; 11.5 cm (Severe) · Amber 11.5–12.4 cm (Moderate) · Green ≥ 12.5 cm (Healthy)
              </p>
            </div>
            {muacError && <p className="text-sm text-destructive">{muacError}</p>}
            <Button type="submit" size="sm" className="w-full">
              <ClipboardCheck className="size-4" />
              Record MUAC Screening
            </Button>
          </form>

          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold">Recent Screenings ({screenings.length})</h3>
            {screenings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No MUAC checks logged yet.</p>
            ) : (
              <div className="space-y-2">
                {screenings.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium">{s.childName}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.ageMonths} mo · Household: {s.householdHead}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-mono text-sm font-semibold">{s.muacCm.toFixed(1)} cm</span>
                      <Badge variant={s.status}>
                        {s.status === "severe" ? "Severe" : s.status === "moderate" ? "Moderate" : "Healthy"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-7">
        <CardHeader>
          <CardTitle className="text-lg">Duplicate Clinic Referral Slips</CardTitle>
          <p className="text-sm text-muted-foreground">
            Issue standardized two-part slips (CHP copy &amp; clinic copy) and verify clinic follow-through.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleReferralSubmit} className="grid gap-3 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ref-patient">Patient Name</Label>
              <Input id="ref-patient" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref-hh">Household Head</Label>
              <Input id="ref-hh" value={householdHead} onChange={(e) => setHouseholdHead(e.target.value)} placeholder="Household head" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ref-reason">Reason for Referral</Label>
              <Input id="ref-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Persistent fever & malaria test, antenatal danger signs, or MUAC < 11.5 cm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref-clinic">Receiving Health Facility</Label>
              <Select value={clinic} onValueChange={setClinic}>
                <SelectTrigger id="ref-clinic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCAL_CLINICS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref-chp">Community Health Promoter (CHP)</Label>
              <Input id="ref-chp" value={promoterName} onChange={(e) => setPromoterName(e.target.value)} placeholder="CHP full name" />
            </div>
            {refError && <p className="text-sm text-destructive sm:col-span-2">{refError}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">
                <FileText className="size-4" />
                Issue Duplicate Referral Slip
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {referrals.length === 0 ? (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                No clinic referral slips issued yet.
              </p>
            ) : (
              referrals.map((r) => (
                <div key={r.id} className="rounded-lg border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-mono text-xs font-semibold text-primary">{r.slipNumber}</span>
                        <Badge variant={r.status === "completed" ? "healthy" : "moderate"}>
                          {r.status === "completed" ? "Completed at Clinic" : "Referred — Awaiting Clinic"}
                        </Badge>
                      </div>
                      <div className="mt-1 font-medium">
                        {r.patientName}{" "}
                        <span className="font-normal text-muted-foreground">· Household: {r.householdHead}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.reason}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={r.status === "completed" ? "outline" : "default"}
                        onClick={() => {
                          onToggleReferralStatus(r.id);
                          toast.success(
                            r.status === "completed"
                              ? `${r.slipNumber} marked pending.`
                              : `${r.slipNumber} verified completed at clinic.`,
                          );
                        }}
                      >
                        <CheckCircle2 className="size-3.5" />
                        {r.status === "completed" ? "Reopen" : "Verify Clinic Visit"}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete slip ${r.slipNumber}`}
                        onClick={() => onDeleteReferral(r.id)}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <div className="slip-divider mt-3 grid gap-2 pt-3 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      <span className="font-semibold text-foreground">CHP Copy:</span> Issued {r.issuedAt} by{" "}
                      {r.promoterName}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Clinic Copy:</span> {r.clinic}
                      {r.completedAt ? ` · Verified ${r.completedAt}` : " · Pending intake"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}