import { useState } from "react";
import { Check, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PRIORITY_GROUPS,
  validatePositiveInt,
  type Household,
  type PriorityGroup,
} from "@/lib/hafisuhu";

interface HouseholdsPanelProps {
  households: Household[];
  onAdd: (household: Household) => void;
  onToggleHabit: (
    id: string,
    field: "safeWaterAndHandwashing" | "mosquitoNetUsage" | "timelyClinicVisits",
  ) => void;
  onDelete: (id: string) => void;
}

export function HouseholdsPanel({ households, onAdd, onToggleHabit, onDelete }: HouseholdsPanelProps) {
  const [open, setOpen] = useState(false);
  const [headName, setHeadName] = useState("");
  const [zone, setZone] = useState("");
  const [members, setMembers] = useState("4");
  const [groups, setGroups] = useState<PriorityGroup[]>(["Children under 5"]);
  const [wash, setWash] = useState(true);
  const [net, setNet] = useState(true);
  const [clinic, setClinic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGroup = (group: PriorityGroup) => {
    setGroups((prev) => (prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headName.trim() || !zone.trim()) {
      setError("Enter both the household head name and Kakuma zone or village.");
      return;
    }
    const memberCheck = validatePositiveInt(members, "Household size", 30);
    if ("error" in memberCheck) {
      setError(memberCheck.error);
      return;
    }
    onAdd({
      id: `hh-${Date.now()}`,
      headName: headName.trim(),
      zone: zone.trim(),
      members: memberCheck.value,
      priorityGroups: groups,
      safeWaterAndHandwashing: wash,
      mosquitoNetUsage: net,
      timelyClinicVisits: clinic,
      lastVisited: new Date().toISOString().slice(0, 10),
    });
    setHeadName("");
    setZone("");
    setMembers("4");
    setGroups(["Children under 5"]);
    setError(null);
    setOpen(false);
    toast.success("Household added to the Hafisuhu register.");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Household Register</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track priority households and update preventive health checks during each home visit.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" />
              Register Household
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Household</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="hh-head">Household Head</Label>
                  <Input id="hh-head" value={headName} onChange={(e) => setHeadName(e.target.value)} placeholder="e.g., Esther Akiru" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hh-members">Household Size</Label>
                  <Input id="hh-members" type="number" min={1} max={30} value={members} onChange={(e) => setMembers(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hh-zone">Zone / Village (Kakuma & Turkana)</Label>
                <Input id="hh-zone" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="e.g., Kakuma 1 · Block 7" />
              </div>
              <div className="space-y-2">
                <Label>Priority Household Members</Label>
                <div className="flex flex-wrap gap-3">
                  {PRIORITY_GROUPS.map((group) => (
                    <label key={group} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={groups.includes(group)} onCheckedChange={() => toggleGroup(group)} />
                      {group}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-t pt-3">
                <Label>Preventive Practices Observed</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={wash} onCheckedChange={(v) => setWash(v === true)} />
                    Safe water & WASH
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={net} onCheckedChange={(v) => setNet(v === true)} />
                    Mosquito nets
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={clinic} onCheckedChange={(v) => setClinic(v === true)} />
                    Timely clinic visits
                  </label>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit">Save Household</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {households.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Users className="mb-2 size-6 text-muted-foreground" />
            <p className="font-medium">No households registered yet</p>
            <p className="text-sm text-muted-foreground">Add a household to start tracking home visits and preventive habits.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Household & Zone</TableHead>
                  <TableHead>Priority Members</TableHead>
                  <TableHead className="text-center">Safe Water / WASH</TableHead>
                  <TableHead className="text-center">Mosquito Nets</TableHead>
                  <TableHead className="text-center">Clinic Visits</TableHead>
                  <TableHead className="text-right">Last Visit</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {households.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="font-medium">{h.headName}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.zone} · {h.members} members
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {h.priorityGroups.length > 0 ? (
                          h.priorityGroups.map((g) => (
                            <Badge key={g} variant="secondary" className="font-normal">
                              {g}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">General household</span>
                        )}
                      </div>
                    </TableCell>
                    {(
                      [
                        ["safeWaterAndHandwashing", "Safe water and handwashing"],
                        ["mosquitoNetUsage", "Mosquito net usage"],
                        ["timelyClinicVisits", "Timely clinic visits"],
                      ] as const
                    ).map(([field, label]) => (
                      <TableCell key={field} className="text-center">
                        <Button
                          type="button"
                          size="sm"
                          variant={h[field] ? "secondary" : "outline"}
                          aria-label={`Toggle ${label} for ${h.headName}`}
                          onClick={() => onToggleHabit(h.id, field)}
                          className="h-7 px-2.5 text-xs"
                        >
                          {h[field] ? (
                            <>
                              <Check className="size-3.5 text-status-healthy" />
                              Yes
                            </>
                          ) : (
                            "Pending"
                          )}
                        </Button>
                      </TableCell>
                    ))}
                    <TableCell className="tabular-mono text-right text-xs text-muted-foreground">
                      {h.lastVisited}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${h.headName}`}
                        onClick={() => {
                          onDelete(h.id);
                          toast("Household removed from register.");
                        }}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}