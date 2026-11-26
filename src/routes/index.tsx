import { createFileRoute } from "@tanstack/react-router";
import { Activity, BarChart3, BookOpen, ClipboardCheck, ShieldPlus, Users } from "lucide-react";
import { EducationPanel } from "@/components/hafisuhu/education-panel";
import { HouseholdsPanel } from "@/components/hafisuhu/households-panel";
import { PilotResultsPanel } from "@/components/hafisuhu/pilot-results-panel";
import { ScreeningReferralsPanel } from "@/components/hafisuhu/screening-referrals-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHafisuhuStore } from "@/hooks/use-hafisuhu-store";
import { computeIndicators } from "@/lib/hafisuhu";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hafisuhu — Community Health Field Tracker (Kakuma, Turkana)" },
      {
        name: "description",
        content:
          "Integrated community healthcare system for Kakuma and Turkana County: household register, MUAC child nutrition screening, health education log, and duplicate clinic referral slips.",
      },
      { property: "og:title", content: "Hafisuhu — Community Health Field Tracker" },
      {
        property: "og:description",
        content:
          "Household preventive care, child MUAC nutrition checks, multi-topic outreach, and clinic referral tracking for Turkana County.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const store = useHafisuhuStore();
  const stats = computeIndicators(store.households, store.referrals);

  const summaryCards = [
    {
      label: "Safe Water & Handwashing",
      value: `${stats.washPct}%`,
      detail: `Pilot: 42% → 84% · ${stats.householdCount} households`,
    },
    {
      label: "Consistent Mosquito Nets",
      value: `${stats.malariaPct}%`,
      detail: "Pilot: 51% → 88% (+37%)",
    },
    {
      label: "Timely Clinic Visits",
      value: `${stats.clinicPct}%`,
      detail: "Pilot: 48% → 81% (+33%)",
    },
    {
      label: "Completed Referrals",
      value: `${stats.referralCompletedPct}%`,
      detail: `${stats.referralCompletedCount} of ${stats.referralTotalCount} slips verified · Pilot 76%`,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldPlus className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Hafisuhu</h1>
              <p className="text-xs text-muted-foreground">
                Integrated Community Healthcare System · Kakuma, Turkana County
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-3.5 text-primary" />
            <span>Kenya Community Health Strategy · Saved on this device</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section aria-label="Key health indicators" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="tabular-mono mt-1.5 text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs defaultValue="households" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:inline-flex sm:w-auto">
            <TabsTrigger value="households" className="gap-1.5">
              <Users className="size-4" />
              Households
            </TabsTrigger>
            <TabsTrigger value="screening" className="gap-1.5">
              <ClipboardCheck className="size-4" />
              MUAC &amp; Referrals
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-1.5">
              <BookOpen className="size-4" />
              Health Education
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-1.5">
              <BarChart3 className="size-4" />
              Pilot Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="households">
            <HouseholdsPanel
              households={store.households}
              onAdd={store.addHousehold}
              onToggleHabit={store.toggleHouseholdHabit}
              onDelete={store.deleteHousehold}
            />
          </TabsContent>

          <TabsContent value="screening">
            <ScreeningReferralsPanel
              households={store.households}
              screenings={store.screenings}
              referrals={store.referrals}
              onAddScreening={store.addScreening}
              onAddReferral={store.addReferral}
              onToggleReferralStatus={store.toggleReferralStatus}
              onDeleteReferral={store.deleteReferral}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationPanel
              sessions={store.sessions}
              onAdd={store.addSession}
              onDelete={store.deleteSession}
            />
          </TabsContent>

          <TabsContent value="results">
            <PilotResultsPanel households={store.households} referrals={store.referrals} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
