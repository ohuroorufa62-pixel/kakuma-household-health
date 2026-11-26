import { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EDUCATION_TOPICS,
  validatePositiveInt,
  type EducationSession,
  type EducationTopic,
} from "@/lib/hafisuhu";

interface EducationPanelProps {
  sessions: EducationSession[];
  onAdd: (session: EducationSession) => void;
  onDelete: (id: string) => void;
}

export function EducationPanel({ sessions, onAdd, onDelete }: EducationPanelProps) {
  const [zone, setZone] = useState("");
  const [format, setFormat] = useState<EducationSession["format"]>("Neighborhood health circle");
  const [language, setLanguage] = useState<EducationSession["language"]>("Turkana");
  const [topics, setTopics] = useState<EducationTopic[]>(["Water & Sanitation (WASH)"]);
  const [householdsReached, setHouseholdsReached] = useState("10");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleTopic = (topic: EducationTopic) => {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone.trim()) {
      setError("Enter the Kakuma zone or village where the session took place.");
      return;
    }
    if (topics.length === 0) {
      setError("Select at least one Hafisuhu Integrated Health Guide topic.");
      return;
    }
    const reachedCheck = validatePositiveInt(householdsReached, "Households reached", 500);
    if ("error" in reachedCheck) {
      setError(reachedCheck.error);
      return;
    }
    onAdd({
      id: `ed-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      zone: zone.trim(),
      format,
      language,
      topics,
      householdsReached: reachedCheck.value,
      notes: notes.trim() || "Covered practical household prevention steps using the Hafisuhu Guide.",
    });
    setZone("");
    setNotes("");
    setError(null);
    toast.success("Health education session logged.");
  };

  const topicCounts = EDUCATION_TOPICS.map((topic) => ({
    topic,
    count: sessions.filter((s) => s.topics.includes(topic)).length,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-lg">Log Health Education Session</CardTitle>
          <p className="text-sm text-muted-foreground">
            Record weekly household visits or neighborhood health circles using the Hafisuhu Guide.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ed-zone">Zone / Village</Label>
              <Input id="ed-zone" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="e.g., Kakuma 2 · Phase 2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-format">Session Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as EducationSession["format"])}>
                <SelectTrigger id="ed-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Neighborhood health circle">Neighborhood health circle</SelectItem>
                  <SelectItem value="Household visit">Household visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ed-lang">Language Delivered</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as EducationSession["language"])}>
                  <SelectTrigger id="ed-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Turkana">Turkana</SelectItem>
                    <SelectItem value="Swahili">Swahili</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-reached">Households Reached</Label>
                <Input id="ed-reached" type="number" min={1} max={500} value={householdsReached} onChange={(e) => setHouseholdsReached(e.target.value)} className="tabular-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Integrated Health Guide Topics</Label>
              <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                {EDUCATION_TOPICS.map((topic) => (
                  <label key={topic} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={topics.includes(topic)} onCheckedChange={() => toggleTopic(topic)} />
                    {topic}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-notes">Session Summary</Label>
              <Textarea id="ed-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key caregiver questions, demonstrations, or follow-up actions..." />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="sm" className="w-full">
              <Plus className="size-4" />
              Log Education Session
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Integrated Guide Topic Coverage</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {topicCounts.map(({ topic, count }) => (
              <div key={topic} className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2.5 text-sm">
                <span className="font-medium">{topic}</span>
                <Badge variant={count > 0 ? "healthy" : "outline"} className="tabular-mono shrink-0 whitespace-nowrap">
                  {count} {count === 1 ? "session" : "sessions"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recorded Outreach Sessions ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <BookOpen className="mb-2 size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No education sessions recorded yet.</p>
              </div>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="rounded-lg border bg-background p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{s.zone}</span>
                        <Badge variant="secondary">{s.format}</Badge>
                        <Badge variant="outline">{s.language}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{s.notes}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove session from ${s.zone}`}
                      onClick={() => onDelete(s.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
                    <div className="flex flex-wrap gap-1.5">
                      {s.topics.map((t) => (
                        <span key={t} className="rounded bg-muted px-2 py-0.5 text-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="tabular-mono">
                      {s.householdsReached} households · {s.date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}