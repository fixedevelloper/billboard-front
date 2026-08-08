"use client";

import { FormEvent, use, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractErrorMessage, generateReport, getCampaign, getReportsByTarget } from "@/lib/api";

const emptyForm = {
  startDate: "",
  endDate: "",
  totalImpressions: "0",
  totalInteractions: "0",
  totalRevenue: "0",
  occupancyRate: "0",
};

export default function CampaignReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("reporting");
  const tCommon = useTranslations("common");

  const { data: campaign } = useSWR(["campaign", id], () => getCampaign(id));
  const { data: reports, mutate: mutateReports } = useSWR(["reports", id], () => getReportsByTarget(id));

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof emptyForm) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await generateReport({
        targetId: id,
        type: "CAMPAIGN_PERFORMANCE",
        startDate: form.startDate,
        endDate: form.endDate,
        totalImpressions: Number(form.totalImpressions),
        totalInteractions: Number(form.totalInteractions),
        totalRevenue: form.totalRevenue,
        occupancyRate: form.occupancyRate,
      });
      setForm(emptyForm);
      await mutateReports();
    } catch (err) {
      setError(extractErrorMessage(err, t("generate")));
    } finally {
      setSubmitting(false);
    }
  }

  if (!campaign) {
    return <p className="mx-auto max-w-2xl px-4 py-12 text-sm text-muted-foreground">{tCommon("loading")}</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Link href={`/campaigns/${id}`} className="text-sm text-muted-foreground hover:underline">
        ← {campaign.name}
      </Link>

      <div className="flex flex-col gap-4">
        {reports && reports.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {report.startDate} → {report.endDate}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t("impressions")}: </span>
                {report.totalImpressions}
              </div>
              <div>
                <span className="text-muted-foreground">{t("interactions")}: </span>
                {report.totalInteractions}
              </div>
              <div>
                <span className="text-muted-foreground">{t("revenue")}: </span>
                {report.totalRevenue}
              </div>
              <div>
                <span className="text-muted-foreground">{t("occupancy")}: </span>
                {report.occupancyRate}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("generateTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <Input
                name="startDate"
                type="datetime-local"
                label={t("startDate")}
                value={form.startDate}
                onChange={updateField("startDate")}
                required
              />
              <Input
                name="endDate"
                type="datetime-local"
                label={t("endDate")}
                value={form.endDate}
                onChange={updateField("endDate")}
                required
              />
            </div>
            <div className="flex gap-3">
              <Input
                name="totalImpressions"
                type="number"
                label={t("impressions")}
                value={form.totalImpressions}
                onChange={updateField("totalImpressions")}
                required
              />
              <Input
                name="totalInteractions"
                type="number"
                label={t("interactions")}
                value={form.totalInteractions}
                onChange={updateField("totalInteractions")}
                required
              />
            </div>
            <div className="flex gap-3">
              <Input
                name="totalRevenue"
                type="number"
                step="0.01"
                label={t("revenue")}
                value={form.totalRevenue}
                onChange={updateField("totalRevenue")}
                required
              />
              <Input
                name="occupancyRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                label={t("occupancy")}
                value={form.occupancyRate}
                onChange={updateField("occupancyRate")}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="sm" loading={submitting} disabled={submitting}>
              {submitting ? tCommon("loading") : t("generate")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
