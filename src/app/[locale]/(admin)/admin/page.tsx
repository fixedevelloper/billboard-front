"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import { History, ScrollText, Settings2, Star, UserCog, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/StatTile";
import {
  AuditAction,
  ConfigType,
  activateMediaBuyer,
  activateOwner,
  approveReview,
  extractErrorMessage,
  getAllSettings,
  getAuditLogs,
  listMediaBuyers,
  logAdminAction,
  rejectReview,
  saveSetting,
  verifyAdvertiser,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

const SECTIONS = [
  { id: "quick-actions", labelKey: "quickActions", icon: Zap },
  { id: "review-moderation", labelKey: "reviewModeration", icon: Star },
  { id: "platform-settings", labelKey: "platformSettings", icon: Settings2 },
  { id: "log-action", labelKey: "logCustomAction", icon: ScrollText },
  { id: "audit-log", labelKey: "auditLog", icon: History },
] as const;

const AUDIT_ACTIONS: AuditAction[] = [
  "APPROVE_BILLBOARD",
  "REJECT_BILLBOARD",
  "VERIFY_ADVERTISER",
  "SUSPEND_USER",
  "REFUND_BOOKING",
];

const CONFIG_TYPES: ConfigType[] = ["STRING", "NUMBER", "BOOLEAN", "JSON"];

const emptySettingForm = { key: "", value: "", description: "", type: "STRING" as ConfigType };

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const tCommon = useTranslations("common");
  const { adminId } = useAuth();

  const { data: auditLogs, mutate: mutateAuditLogs } = useSWR(
    adminId ? ["audit-logs", adminId] : null,
    ([, id]) => getAuditLogs(id),
  );
  const { data: settings, mutate: mutateSettings } = useSWR(
    adminId ? "platform-settings" : null,
    getAllSettings,
  );
  const { data: mediaBuyers } = useSWR(adminId ? "media-buyers" : null, listMediaBuyers);

  const [quickActionTargetId, setQuickActionTargetId] = useState("");
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [logForm, setLogForm] = useState({
    action: "SUSPEND_USER" as AuditAction,
    targetEntity: "",
    targetId: "",
    details: "",
  });
  const [logging, setLogging] = useState(false);

  const [reviewId, setReviewId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [runningReviewAction, setRunningReviewAction] = useState<string | null>(null);

  const [settingForm, setSettingForm] = useState(emptySettingForm);
  const [savingSetting, setSavingSetting] = useState(false);

  async function runQuickAction(
    kind: "verifyAdvertiser" | "activateOwner" | "activateMediaBuyer",
    // AuditAction n'a pas de valeur pour "activation propriétaire/media buyer" (seulement
    // APPROVE_BILLBOARD, REJECT_BILLBOARD, VERIFY_ADVERTISER, SUSPEND_USER, REFUND_BOOKING) :
    // pas d'entrée d'audit forcée avec un libellé inexact, on journalise seulement quand
    // l'action correspond vraiment à une valeur de l'enum.
    auditAction: AuditAction | null,
    targetEntity: string,
  ) {
    if (!adminId || !quickActionTargetId) return;
    setRunningAction(kind);
    setError(null);
    try {
      if (kind === "verifyAdvertiser") await verifyAdvertiser(quickActionTargetId);
      if (kind === "activateOwner") await activateOwner(quickActionTargetId);
      if (kind === "activateMediaBuyer") await activateMediaBuyer(quickActionTargetId);

      if (auditAction) {
        await logAdminAction(adminId, {
          action: auditAction,
          targetEntity,
          targetId: quickActionTargetId,
        });
        await mutateAuditLogs();
      }
      setQuickActionTargetId("");
    } catch (err) {
      setError(extractErrorMessage(err, t("run")));
    } finally {
      setRunningAction(null);
    }
  }

  async function handleApproveReview() {
    if (!reviewId) return;
    setRunningReviewAction("approve");
    setError(null);
    try {
      await approveReview(reviewId);
      setReviewId("");
    } catch (err) {
      setError(extractErrorMessage(err, t("approveReview")));
    } finally {
      setRunningReviewAction(null);
    }
  }

  async function handleRejectReview() {
    if (!reviewId || !rejectReason) return;
    setRunningReviewAction("reject");
    setError(null);
    try {
      await rejectReview(reviewId, rejectReason);
      setReviewId("");
      setRejectReason("");
    } catch (err) {
      setError(extractErrorMessage(err, t("rejectReview")));
    } finally {
      setRunningReviewAction(null);
    }
  }

  async function handleSaveSetting(event: FormEvent) {
    event.preventDefault();
    setSavingSetting(true);
    setError(null);
    try {
      await saveSetting({
        key: settingForm.key,
        value: settingForm.value,
        description: settingForm.description || undefined,
        type: settingForm.type,
      });
      setSettingForm(emptySettingForm);
      await mutateSettings();
    } catch (err) {
      setError(extractErrorMessage(err, t("saveSetting")));
    } finally {
      setSavingSetting(false);
    }
  }

  async function handleLogAction(event: FormEvent) {
    event.preventDefault();
    if (!adminId) return;
    setLogging(true);
    setError(null);
    try {
      await logAdminAction(adminId, {
        action: logForm.action,
        targetEntity: logForm.targetEntity,
        targetId: logForm.targetId,
        details: logForm.details || undefined,
      });
      setLogForm({ action: "SUSPEND_USER", targetEntity: "", targetId: "", details: "" });
      await mutateAuditLogs();
    } catch (err) {
      setError(extractErrorMessage(err, t("logSubmit")));
    } finally {
      setLogging(false);
    }
  }

  if (!adminId) {
    return null;
  }

  const pendingMediaBuyers = mediaBuyers?.filter((m) => m.status === "PENDING").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <nav className="flex flex-wrap gap-1">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <section.icon className="size-3.5" />
              {t(section.labelKey)}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label={t("statAuditActions")} value={auditLogs?.length ?? 0} icon={History} accent="amber" />
        <StatTile label={t("statMediaBuyersPending")} value={pendingMediaBuyers} icon={UserCog} accent="amber" />
        <StatTile label={t("statSettings")} value={settings?.length ?? 0} icon={Settings2} accent="amber" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card id="quick-actions" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="size-4 text-amber-600 dark:text-amber-400" />
            {t("quickActions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            name="targetId"
            label={t("targetIdLabel")}
            value={quickActionTargetId}
            onChange={(event) => setQuickActionTargetId(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!quickActionTargetId || runningAction !== null}
              loading={runningAction === "verifyAdvertiser"}
              onClick={() => runQuickAction("verifyAdvertiser", "VERIFY_ADVERTISER", "Advertiser")}
            >
              {t("verifyAdvertiser")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!quickActionTargetId || runningAction !== null}
              loading={runningAction === "activateOwner"}
              onClick={() => runQuickAction("activateOwner", null, "BillboardOwner")}
            >
              {t("activateOwner")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!quickActionTargetId || runningAction !== null}
              loading={runningAction === "activateMediaBuyer"}
              onClick={() => runQuickAction("activateMediaBuyer", null, "MediaBuyer")}
            >
              {t("activateMediaBuyer")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card id="review-moderation" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-4 text-amber-600 dark:text-amber-400" />
            {t("reviewModeration")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            name="reviewId"
            label={t("reviewIdLabel")}
            value={reviewId}
            onChange={(event) => setReviewId(event.target.value)}
          />
          <Input
            name="rejectReason"
            label={t("rejectReasonLabel")}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!reviewId || runningReviewAction !== null}
              loading={runningReviewAction === "approve"}
              onClick={handleApproveReview}
            >
              {t("approveReview")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!reviewId || !rejectReason || runningReviewAction !== null}
              loading={runningReviewAction === "reject"}
              onClick={handleRejectReview}
            >
              {t("rejectReview")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card id="platform-settings" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="size-4 text-amber-600 dark:text-amber-400" />
            {t("platformSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          {settings && settings.length === 0 && <p className="text-muted-foreground">{t("noSettings")}</p>}
          {settings?.map((setting) => (
            <div key={setting.key} className="rounded-md border p-3">
              <p className="font-medium">
                {setting.key} = {setting.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {setting.type}
                {setting.description ? ` — ${setting.description}` : ""}
              </p>
            </div>
          ))}

          <form className="flex flex-col gap-3 border-t pt-4" onSubmit={handleSaveSetting}>
            <Input
              name="settingKey"
              label={t("settingKey")}
              value={settingForm.key}
              onChange={(event) => setSettingForm((prev) => ({ ...prev, key: event.target.value }))}
              required
            />
            <Input
              name="settingValue"
              label={t("settingValue")}
              value={settingForm.value}
              onChange={(event) => setSettingForm((prev) => ({ ...prev, value: event.target.value }))}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="settingType">
                {t("settingType")}
              </label>
              <select
                id="settingType"
                className="h-10 rounded-md border bg-transparent px-3 text-sm"
                value={settingForm.type}
                onChange={(event) =>
                  setSettingForm((prev) => ({ ...prev, type: event.target.value as ConfigType }))
                }
              >
                {CONFIG_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <Input
              name="settingDescription"
              label={t("settingDescription")}
              value={settingForm.description}
              onChange={(event) => setSettingForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <Button type="submit" size="sm" loading={savingSetting} disabled={savingSetting}>
              {t("saveSetting")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card id="log-action" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="size-4 text-amber-600 dark:text-amber-400" />
            {t("logCustomAction")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handleLogAction}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="action">
                {t("actionType")}
              </label>
              <select
                id="action"
                className="h-10 rounded-md border bg-transparent px-3 text-sm"
                value={logForm.action}
                onChange={(event) =>
                  setLogForm((prev) => ({ ...prev, action: event.target.value as AuditAction }))
                }
              >
                {AUDIT_ACTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <Input
              name="targetEntity"
              label={t("targetEntity")}
              placeholder={t("targetEntityPlaceholder")}
              value={logForm.targetEntity}
              onChange={(event) => setLogForm((prev) => ({ ...prev, targetEntity: event.target.value }))}
              required
            />
            <Input
              name="targetId"
              label={t("targetIdLabel")}
              value={logForm.targetId}
              onChange={(event) => setLogForm((prev) => ({ ...prev, targetId: event.target.value }))}
              required
            />
            <Input
              name="details"
              label={t("detailsLabel")}
              value={logForm.details}
              onChange={(event) => setLogForm((prev) => ({ ...prev, details: event.target.value }))}
            />
            <Button type="submit" size="sm" loading={logging} disabled={logging}>
              {t("logSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card id="audit-log" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4 text-amber-600 dark:text-amber-400" />
            {t("auditLog")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {!auditLogs && <p className="text-muted-foreground">{tCommon("loading")}</p>}
          {auditLogs && auditLogs.length === 0 && <p className="text-muted-foreground">{t("empty")}</p>}
          {auditLogs?.map((log) => (
            <div key={log.id} className="rounded-md border p-3">
              <p className="font-medium">
                {log.action} — {log.targetEntity}
              </p>
              <p className="text-xs text-muted-foreground">{log.targetId}</p>
              {log.details && <p className="text-muted-foreground">{log.details}</p>}
              <p className="text-xs text-muted-foreground">{log.timestamp}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
