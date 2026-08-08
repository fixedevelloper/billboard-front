"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  NotificationLogResponse,
  getNotificationStreamUrl,
  getNotificationsByRecipient,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

export function NotificationBell() {
  const t = useTranslations("notifications");
  const { userId, token, isAuthenticated, hydrated } = useAuth();

  const [notifications, setNotifications] = useState<NotificationLogResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !userId || !token) return;

    let cancelled = false;

    Promise.all([getNotificationsByRecipient(userId), getUnreadNotificationCount(userId)])
      .then(([list, count]) => {
        if (cancelled) return;
        setNotifications(list.slice(0, 20));
        setUnreadCount(count);
      })
      .catch(() => undefined);

    const source = new EventSource(getNotificationStreamUrl(userId, token));
    eventSourceRef.current = source;

    source.addEventListener("connected", () => setConnected(true));
    source.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse((event as MessageEvent).data) as NotificationLogResponse;
        setNotifications((prev) => [notification, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
      } catch {
        // ignore malformed payloads
      }
    });
    source.onerror = () => setConnected(false);

    return () => {
      cancelled = true;
      source.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [hydrated, isAuthenticated, userId, token]);

  async function handleOpenNotification(notification: NotificationLogResponse) {
    if (notification.read) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationAsRead(notification.id);
    } catch {
      // best-effort: on failure the badge may briefly under-count, next refresh corrects it
    }
  }

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("title")}>
          {connected ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="text-sm font-semibold">{t("title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">{t("empty")}</p>
        )}
        <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onSelect={(event) => {
                event.preventDefault();
                handleOpenNotification(notification);
              }}
              className={cn(
                "flex flex-col items-start gap-0.5 whitespace-normal rounded-lg py-2",
                !notification.read && "bg-primary/5",
              )}
            >
              <div className="flex w-full items-center gap-1.5">
                {!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                <span className="truncate text-xs font-semibold text-foreground">
                  {notification.templateCode.replaceAll("_", " ")}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{notification.content}</p>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
