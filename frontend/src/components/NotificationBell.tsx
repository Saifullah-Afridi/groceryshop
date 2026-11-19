import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/apiClient";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  orderId: number | null;
  isRead: boolean;
  createdAt: string;
}

/** Notifications are persisted in Postgres and delivered live through Supabase Realtime. */
export function NotificationBell({ audience }: { audience: "admin" | "customer" }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const auth = audience === "admin" ? "admin" : "customer";
  const listPath = audience === "admin" ? "/notifications/admin" : "/notifications/mine";
  const unread = items.filter((item) => !item.isRead).length;

  const refresh = async () => {
    try { setItems(await api<NotificationItem[]>(listPath, { auth })); } catch { /* login/session state is handled by apiClient */ }
  };
  useEffect(() => {
    let active = true;
    let client: SupabaseClient | null = null;
    let channel: RealtimeChannel | null = null;
    let refreshTokenTimer = 0;
    let retryTimer = 0;
    let connecting = false;

    const connect = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !publishableKey) {
        console.error("Supabase Realtime is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
        return;
      }
      if (!active || connecting) return;
      connecting = true;
      try {
        const result = await api<{ token: string; expiresIn: number }>(
          audience === "admin" ? "/notifications/admin/realtime-token" : "/notifications/mine/realtime-token",
          { auth },
        );
        if (!active) return;
        if (!client) client = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
        await client.realtime.setAuth(result.token);
        if (channel) await client.removeChannel(channel);
        channel = client
          .channel(audience === "admin" ? "rakan-notifications-admin" : "rakan-notifications-customer")
          .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "Notification",
            filter: `audience=eq.${audience === "admin" ? "ADMIN" : "CUSTOMER"}`,
          }, () => { void refresh(); })
          .subscribe((status) => {
            if (!active) return;
            if (status === "SUBSCRIBED") void refresh();
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
              window.clearTimeout(retryTimer);
              retryTimer = window.setTimeout(() => { void connect(); }, 5000);
            }
          });
        window.clearInterval(refreshTokenTimer);
        // Supabase access tokens expire after five minutes; renew before expiry.
        refreshTokenTimer = window.setInterval(() => { void connect(); }, 4 * 60 * 1000);
      } catch (error) {
        if (!active) return;
        console.error("Could not connect to notification Realtime.", error);
        window.clearTimeout(retryTimer);
        retryTimer = window.setTimeout(() => { void connect(); }, 15000);
      } finally {
        connecting = false;
      }
    };

    void refresh();
    void connect();
    return () => {
      active = false;
      window.clearInterval(refreshTokenTimer);
      window.clearTimeout(retryTimer);
      if (client) void client.removeAllChannels();
    };
  }, [listPath, audience, auth]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const markRead = async (id: number) => {
    const path = audience === "admin" ? `/notifications/admin/${id}/read` : `/notifications/mine/${id}/read`;
    try { await api(path, { method: "POST", auth }); await refresh(); } catch { /* keep the item visible */ }
  };
  const markAll = async () => {
    const path = audience === "admin" ? "/notifications/admin/read-all" : "/notifications/mine/read-all";
    try { await api(path, { method: "POST", auth }); await refresh(); } catch { /* retry on next refresh */ }
  };

  return (
    <div className="relative" ref={root}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications" className={`relative grid h-10 w-10 place-items-center rounded-full border transition ${audience === "admin" ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : "border-[#DCEAE1] bg-white text-[#123B2A] hover:bg-[#F0F8F2]"}`}>
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#078A4B] px-1 text-[10px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && <div className="absolute end-0 top-12 z-[80] w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#DCEAE1] bg-white text-[#123B2A] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8EEE9] px-4 py-3">
          <p className="font-bold">Notifications</p>
          <button type="button" onClick={markAll} disabled={!unread} className="inline-flex items-center gap-1 text-xs font-semibold text-[#078A4B] disabled:opacity-40"><CheckCheck size={14} /> Mark all read</button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[#718078]">No notifications yet.</p> : items.map((item) => <div key={item.id} className={`border-b border-[#F0F4F1] px-4 py-3 ${item.isRead ? "bg-white" : "bg-[#F0F8F2]"}`}>
            <button type="button" onClick={() => void markRead(item.id)} className="block w-full text-start">
              <span className="flex items-center justify-between gap-2 text-sm font-bold">{item.title}{!item.isRead && <i className="h-2 w-2 shrink-0 rounded-full bg-[#078A4B]" />}</span>
              <span className="mt-1 block text-xs leading-5 text-[#617268]">{item.message}</span>
              <span className="mt-1 block text-[10px] text-[#87958D]">{new Date(item.createdAt).toLocaleString()}</span>
            </button>
            {item.orderId && <Link to={audience === "admin" ? "/admin/orders" : "/orders"} onClick={() => { void markRead(item.id); setOpen(false); }} className="mt-2 inline-block text-xs font-bold text-[#078A4B]">View order #{item.orderId}</Link>}
          </div>)}
        </div>
      </div>}
    </div>
  );
}
