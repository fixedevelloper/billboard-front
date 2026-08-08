"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listUsers } from "@/lib/api";

export default function AdminUsersPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tCommon = useTranslations("common");
  const { data: users } = useSWR("admin-users", listUsers);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabUsers")}</h1>

      <Card>
        {!users && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {users && users.length === 0 && <p className="text-sm text-muted-foreground">{t("emptyUsers")}</p>}
        {users && users.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colEmail")}</TableHead>
                <TableHead>{t("colRoles")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} tone="neutral">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
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
