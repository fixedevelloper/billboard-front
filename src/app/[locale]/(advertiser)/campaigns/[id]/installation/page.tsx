"use client";

import { FormEvent, use, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  completeInstallationTask,
  extractErrorMessage,
  getBooking,
  getCampaign,
  getInstallationTasksByCampaign,
  scheduleInstallationTask,
  startInstallationTask,
  uploadFile,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

export default function CampaignInstallationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("installation");
  const tCommon = useTranslations("common");
  const { userId } = useAuth();

  const { data: campaign } = useSWR(["campaign", id], () => getCampaign(id));
  const { data: booking } = useSWR(
    campaign ? ["booking", campaign.bookingId] : null,
    ([, bookingId]) => getBooking(bookingId),
  );
  const { data: tasks, mutate: mutateTasks } = useSWR(["installation-tasks", id], () =>
    getInstallationTasksByCampaign(id),
  );

  const [technicianId, setTechnicianId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  async function handleSchedule(event: FormEvent) {
    event.preventDefault();
    if (!booking) return;
    setSubmitting(true);
    setError(null);
    try {
      await scheduleInstallationTask({
        campaignId: id,
        billboardId: booking.billboardId,
        technicianId,
        scheduledDate,
      });
      await mutateTasks();
      setTechnicianId("");
      setScheduledDate("");
    } catch (err) {
      setError(extractErrorMessage(err, t("schedule")));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStart(taskId: string) {
    setRunningTaskId(taskId);
    setError(null);
    try {
      await startInstallationTask(taskId);
      await mutateTasks();
    } catch (err) {
      setError(extractErrorMessage(err, t("start")));
    } finally {
      setRunningTaskId(null);
    }
  }

  async function handleComplete(event: FormEvent, taskId: string) {
    event.preventDefault();
    if (!photoFile || !userId) return;
    setRunningTaskId(taskId);
    setError(null);
    try {
      const uploaded = await uploadFile(photoFile, userId);
      await completeInstallationTask(taskId, { photoFileId: uploaded.id, notes: notes || undefined });
      setPhotoFile(null);
      setNotes("");
      await mutateTasks();
    } catch (err) {
      setError(extractErrorMessage(err, t("complete")));
    } finally {
      setRunningTaskId(null);
    }
  }

  if (!campaign || !booking) {
    return <p className="mx-auto max-w-2xl px-4 py-12 text-sm text-muted-foreground">{tCommon("loading")}</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Link href={`/campaigns/${id}`} className="text-sm text-muted-foreground hover:underline">
        ← {campaign.name}
      </Link>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-4">
        {tasks?.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {t("scheduledFor")}: {task.scheduledDate}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p>
                {t("status")}: <span className="font-medium">{task.status}</span>
              </p>
              {task.proofPhotoUrl && (
                <p className="text-muted-foreground">
                  {t("proofNotes")}: {task.proofNotes ?? "—"}
                </p>
              )}

              {task.status === "SCHEDULED" && (
                <Button
                  size="sm"
                  variant="outline"
                  loading={runningTaskId === task.id}
                  disabled={runningTaskId !== null}
                  onClick={() => handleStart(task.id)}
                >
                  {t("start")}
                </Button>
              )}

              {task.status === "IN_PROGRESS" && (
                <form className="flex flex-col gap-2" onSubmit={(event) => handleComplete(event, task.id)}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                    className="text-sm"
                  />
                  <Input
                    name="notes"
                    label={t("proofNotes")}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    loading={runningTaskId === task.id}
                    disabled={runningTaskId !== null || !photoFile}
                  >
                    {t("complete")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("scheduleTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handleSchedule}>
            <Input
              name="technicianId"
              label={t("technicianId")}
              value={technicianId}
              onChange={(event) => setTechnicianId(event.target.value)}
              required
            />
            <Input
              name="scheduledDate"
              type="datetime-local"
              label={t("scheduledDate")}
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              required
            />
            <Button type="submit" size="sm" loading={submitting} disabled={submitting}>
              {submitting ? tCommon("loading") : t("schedule")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
