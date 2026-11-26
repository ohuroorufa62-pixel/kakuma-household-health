import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PILOT_FINDINGS, type Household, type ReferralSlip, computeIndicators } from "@/lib/hafisuhu";

interface PilotResultsPanelProps {
  households: Household[];
  referrals: ReferralSlip[];
}

export function PilotResultsPanel({ households, referrals }: PilotResultsPanelProps) {
  const live = computeIndicators(households, referrals);

  const liveById: Record<string, number> = {
    wash: live.washPct,
    malaria: live.malariaPct,
    clinic: live.clinicPct,
    referrals: live.referralCompletedPct,
  };

  const chartData = [
    { indicator: "Safe Water & WASH", Baseline: 42, Endline: 84, "Live Register": live.washPct },
    { indicator: "Mosquito Nets", Baseline: 51, Endline: 88, "Live Register": live.malariaPct },
    { indicator: "Clinic Visits", Baseline: 48, Endline: 81, "Live Register": live.clinicPct },
    { indicator: "Referrals Done", Baseline: 0, Endline: 76, "Live Register": live.referralCompletedPct },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pre-and-Post Intervention Findings (Kakuma Pilot)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compares baseline and endline evaluation indicators against your current digital register ({live.householdCount} households, {live.referralTotalCount} referral slips).
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="indicator" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Baseline" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Endline" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Live Register" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Health Indicator</TableHead>
                  <TableHead className="text-right">Before Hafisuhu (Baseline)</TableHead>
                  <TableHead className="text-right">After Hafisuhu (Endline)</TableHead>
                  <TableHead className="text-right">Pilot Improvement</TableHead>
                  <TableHead className="text-right">Live Register</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PILOT_FINDINGS.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="tabular-mono text-right text-muted-foreground">
                      {row.baseline === null ? "—" : `${row.baseline}%`}
                    </TableCell>
                    <TableCell className="tabular-mono text-right font-semibold">{row.endline}%</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="healthy">{row.change}</Badge>
                    </TableCell>
                    <TableCell className="tabular-mono text-right font-semibold text-primary">
                      {liveById[row.id] ?? 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Local Health Facilities</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Adopt standardized duplicate referral slips to verify community-to-clinic patient follow-up.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Community Leaders</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Support monthly neighborhood health circles in local languages to sustain hygiene and nutrition practices.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Digital Register</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use this Hafisuhu digital register to track household visits, MUAC nutrition checks, and long-term clinic referrals.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}