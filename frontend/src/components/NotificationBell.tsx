import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, CircleAlert, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "../services/apiClient";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  orderId: number | null;
  isRead: boolean;
  createdAt: string;
}

type ConnectionState = "connecting" | "connected" | "offline";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export function NotificationBell({
  audience,
}: {
  audience: "admin" | "customer";
}) {
  const queryClient = useQueryClient();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const root = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<ConnectionState>("connecting");

  const auth = audience;

  const listPath =
    audience === "admin" ? "/notifications/admin" : "/notifications/mine";

  const streamPath =
    audience === "admin"
      ? "/notifications/admin/stream"
      : "/notifications/mine/stream";

  const unread = items.length;

  const updateConnection = useCallback((state: ConnectionState) => {
    connectionRef.current = state;
    setConnection(state);
  }, []);

  // Display only unread notifications.
  const refresh = useCallback(async () => {
    try {
      const latest = await api<NotificationItem[]>(listPath, { auth });
      setItems(latest.filter((item) => !item.isRead));
    } catch {
      // Authentication/session handling remains centralized in apiClient.
    }
  }, [auth, listPath]);

  const refreshRelatedData = useCallback(() => {
    if (audience === "admin") {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "orders"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      });
    } else {
      void queryClient.invalidateQueries({
        queryKey: ["orders", "mine"],
      });
    }
  }, [audience, queryClient]);

  useEffect(() => {
    let active = true;
    let retryTimer = 0;
    let fallbackTimer = 0;
    let controller: AbortController | null = null;

    const getToken = () => {
      return localStorage.getItem(
        audience === "admin" ? "rakan-admin-token" : "rakan-customer-token",
      );
    };

    const scheduleRetry = (delay = 5000) => {
      if (!active) return;

      window.clearTimeout(retryTimer);

      retryTimer = window.setTimeout(() => {
        void connect();
      }, delay);
    };

    const handleNotificationEvent = (data: string) => {
      if (!active) return;

      try {
        const event = JSON.parse(data);

        if (event.type === "notification") {
          void refresh();
          refreshRelatedData();
        }
      } catch (error) {
        console.error("Invalid notification SSE event:", error);
      }
    };

    const connect = async () => {
      if (!active || controller) return;

      const token = getToken();

      if (!token) {
        updateConnection("offline");
        scheduleRetry(10000);
        return;
      }

      const currentController = new AbortController();
      controller = currentController;

      updateConnection("connecting");

      try {
        const response = await fetch(`${API_BASE_URL}${streamPath}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          cache: "no-store",
          signal: currentController.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Notification stream failed with status ${response.status}`,
          );
        }

        if (!response.body) {
          throw new Error("Notification stream is not supported.");
        }

        updateConnection("connected");

        void refresh();
        refreshRelatedData();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (active) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const messages = buffer.split(/\r?\n\r?\n/);
          buffer = messages.pop() ?? "";

          for (const message of messages) {
            if (!active) break;

            const data = message
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim())
              .join("\n");

            if (data) {
              handleNotificationEvent(data);
            }
          }
        }

        if (active) {
          throw new Error("Notification stream disconnected.");
        }
      } catch (error) {
        if (active && !currentController.signal.aborted) {
          updateConnection("offline");
          console.error("Notification stream disconnected:", error);
        }
      } finally {
        if (controller === currentController) {
          controller = null;

          if (active) {
            updateConnection("offline");
            scheduleRetry(5000);
          }
        }
      }
    };

    void refresh();
    void connect();

    fallbackTimer = window.setInterval(() => {
      if (!active || document.visibilityState !== "visible") return;

      if (connectionRef.current !== "connected") {
        void refresh();
        refreshRelatedData();
      }
    }, 15000);

    const onFocus = () => {
      void refresh();

      if (connectionRef.current !== "connected") {
        controller?.abort();
        controller = null;

        window.clearTimeout(retryTimer);
        void connect();
      }
    };

    window.addEventListener("focus", onFocus);

    return () => {
      active = false;

      window.clearTimeout(retryTimer);
      window.clearInterval(fallbackTimer);

      window.removeEventListener("focus", onFocus);

      controller?.abort();
      controller = null;
    };
  }, [audience, streamPath, refresh, refreshRelatedData, updateConnection]);

  // Close dropdown when clicking outside.
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", close);

    return () => {
      document.removeEventListener("pointerdown", close);
    };
  }, []);

  const markRead = async (id: number) => {
    const path =
      audience === "admin"
        ? `/notifications/admin/${id}/read`
        : `/notifications/mine/${id}/read`;

    setItems((current) => current.filter((item) => item.id !== id));

    try {
      await api(path, {
        method: "POST",
        auth,
      });

      await refresh();
    } catch {
      await refresh();
    }
  };

  const markAll = async () => {
    if (!unread || markingAll) return;

    const path =
      audience === "admin"
        ? "/notifications/admin/read-all"
        : "/notifications/mine/read-all";

    setMarkingAll(true);
    setItems([]);

    try {
      await api(path, {
        method: "POST",
        auth,
      });

      await refresh();
    } catch {
      await refresh();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className={`
          relative grid h-10 w-10 shrink-0 place-items-center rounded-full
          border border-transparent bg-transparent
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-yellow-400
          ${
            audience === "admin"
              ? "hover:bg-yellow-400/10 hover:border-yellow-400/30"
              : "hover:bg-[#123B2A]/10 hover:border-[#123B2A]/20"
          }
        `}
      >
        <Bell
          size={19}
          strokeWidth={2.3}
          className={
            audience === "admin" ? "text-yellow-400" : "text-[#123B2A]"
          }
        />

        {unread > 0 && (
          <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#078A4B] px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Notifications"
          className="
            absolute end-0 top-full z-[100] mt-3
            flex w-[min(360px,calc(100vw-2rem))]
            flex-col overflow-hidden rounded-2xl
            border border-[#DCEAE1] bg-white text-[#123B2A]
            shadow-[0_18px_55px_rgba(3,29,26,0.18)]
          "
        >
          <header className="flex min-h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[#E8EEE9] px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold">Notifications</h3>

              <p className="mt-0.5 text-[11px] text-[#87958D]">
                {unread > 0 ? `${unread} unread` : "You're all caught up"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void markAll()}
              disabled={!unread || markingAll}
              className="
                inline-flex h-9 shrink-0 items-center justify-center gap-1.5
                whitespace-nowrap rounded-lg border border-[#DCEAE1]
                bg-white px-3 text-xs font-semibold text-[#078A4B]
                transition-colors hover:bg-[#F0F8F2]
                disabled:cursor-not-allowed disabled:opacity-40
                focus:outline-none focus:ring-2 focus:ring-[#078A4B]
              "
            >
              {markingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}

              <span>Mark all as read</span>
            </button>
          </header>

          {connection === "offline" && (
            <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2 text-[11px] text-amber-800">
              <CircleAlert size={13} className="shrink-0" />
              Live connection interrupted. Reconnecting…
            </div>
          )}

          {connection === "connecting" && (
            <div className="flex items-center gap-2 border-b border-[#E8EEE9] bg-[#FBFDFC] px-4 py-2 text-[11px] text-[#87958D]">
              <Loader2 size={13} className="animate-spin" />
              Connecting to live notifications…
            </div>
          )}

          <div className="max-h-[min(65vh,420px)] overflow-y-auto overscroll-contain">
            {items.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#F0F8F2] text-[#078A4B]">
                  <Bell size={19} />
                </span>

                <p className="mt-3 text-sm font-semibold text-[#123B2A]">
                  You're all caught up!
                </p>

                <p className="mt-1 text-xs text-[#87958D]">
                  New order and status updates will appear here.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <article
                  key={item.id}
                  className="
                    border-b border-[#F0F4F1] px-4 py-3.5
                    bg-[#F0F8F2] transition-colors hover:bg-[#F8FBF9]
                  "
                >
                  <button
                    type="button"
                    onClick={() => void markRead(item.id)}
                    className="block w-full min-w-0 text-start"
                  >
                    <span className="flex min-w-0 items-start justify-between gap-3">
                      <span className="min-w-0 break-words text-sm font-bold leading-5 text-[#123B2A]">
                        {item.title}
                      </span>

                      <span
                        aria-label="Unread"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#078A4B]"
                      />
                    </span>

                    <span className="mt-1 block break-words text-xs leading-5 text-[#617268]">
                      {item.message}
                    </span>

                    <time
                      dateTime={item.createdAt}
                      className="mt-2 block text-[10px] text-[#87958D]"
                    >
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </button>

                  {item.orderId && (
                    <Link
                      to={audience === "admin" ? "/admin/orders" : "/orders"}
                      onClick={() => {
                        void markRead(item.id);
                        setOpen(false);
                      }}
                      className="
                        mt-2 inline-flex min-h-7 items-center
                        text-xs font-bold text-[#078A4B]
                        hover:text-[#045E34] hover:underline
                      "
                    >
                      View order #{item.orderId}
                    </Link>
                  )}
                </article>
              ))
            )}
          </div>

          <footer className="flex shrink-0 items-center justify-between border-t border-[#E8EEE9] bg-[#FBFDFC] px-4 py-2.5 text-[10px] text-[#87958D]">
            <span>
              {connection === "connected"
                ? "Live updates enabled"
                : "Waiting for live connection"}
            </span>

            <button
              type="button"
              onClick={() => void refresh()}
              className="font-semibold text-[#078A4B] hover:underline"
            >
              Refresh
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}
