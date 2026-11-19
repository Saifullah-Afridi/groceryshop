import { subscribeToNotifications } from "./notificationStream.js";

function openStream(req, res, audience, customerId = null) {
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();
  res.write(": notification stream opened\n\n");

  const unsubscribe = subscribeToNotifications(res, audience, customerId);
  const heartbeat = setInterval(() => {
    if (!res.destroyed && !res.writableEnded) res.write(": keep-alive\n\n");
  }, 25000);
  heartbeat.unref?.();

  const close = () => {
    clearInterval(heartbeat);
    unsubscribe();
  };
  req.on("close", close);
  res.on("close", close);
}

export function streamAdminNotifications(req, res) {
  openStream(req, res, "ADMIN");
}

export function streamCustomerNotifications(req, res) {
  openStream(req, res, "CUSTOMER", Number(req.auth.sub));
}
