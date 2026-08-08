"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usePayerMap } from "@/components/admin/usePayerMap";
import { approveReview, extractErrorMessage, listAllBillboards, listAllReviews, rejectReview } from "@/lib/api";

export default function AdminReviewsPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tDashboard = useTranslations("admin.dashboard");
  const tCommon = useTranslations("common");
  const { data: reviews, mutate } = useSWR("admin-reviews", listAllReviews);
  const { data: billboards } = useSWR("admin-billboards", listAllBillboards);
  const payerMap = usePayerMap();

  const billboardMap = useMemo(() => new Map(billboards?.map((b) => [b.id, b.title]) ?? []), [billboards]);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setRunningId(id);
    setError(null);
    try {
      await approveReview(id);
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, tDashboard("approveReview")));
    } finally {
      setRunningId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = rejectReasons[id] ?? "";
    if (!reason) return;
    setRunningId(id);
    setError(null);
    try {
      await rejectReview(id, reason);
      setRejectingId(null);
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, tDashboard("rejectReview")));
    } finally {
      setRunningId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabReviews")}</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        {!reviews && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {reviews && reviews.length === 0 && <p className="text-sm text-muted-foreground">{t("emptyReviews")}</p>}
        {reviews && reviews.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colTarget")}</TableHead>
                <TableHead>{t("colAuthor")}</TableHead>
                <TableHead>{t("colRating")}</TableHead>
                <TableHead>{t("colComment")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{tDashboard("quickActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {billboardMap.get(review.targetId) ?? review.targetId}
                  </TableCell>
                  <TableCell>{payerMap.get(review.authorId) ?? review.authorId}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      {review.rating}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{review.comment ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={review.status} />
                  </TableCell>
                  <TableCell>
                    {review.status === "PENDING" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            loading={runningId === review.id}
                            disabled={runningId !== null}
                            onClick={() => handleApprove(review.id)}
                          >
                            {tDashboard("approveReview")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={runningId !== null}
                            onClick={() => setRejectingId(rejectingId === review.id ? null : review.id)}
                          >
                            {tDashboard("rejectReview")}
                          </Button>
                        </div>
                        {rejectingId === review.id && (
                          <div className="flex items-end gap-2">
                            <Input
                              name={`rejectReason-${review.id}`}
                              label={tDashboard("rejectReasonLabel")}
                              value={rejectReasons[review.id] ?? ""}
                              onChange={(event) =>
                                setRejectReasons((prev) => ({ ...prev, [review.id]: event.target.value }))
                              }
                            />
                            <Button
                              size="sm"
                              loading={runningId === review.id}
                              disabled={runningId !== null || !rejectReasons[review.id]}
                              onClick={() => handleReject(review.id)}
                            >
                              {tDashboard("rejectReview")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
