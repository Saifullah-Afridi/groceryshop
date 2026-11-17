import { subscribeToNotifications } from "./notifications.realtime.js";

export function streamNotifications(req, res) {
  const isAdmin = req.auth.role === "admin";

  res.status(200);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.flushHeaders?.();

  const send = (data) => {
    if (res.writableEnded || res.destroyed) return;

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Confirm that the stream is connected.
  send({ type: "connected" });

  const unsubscribe = subscribeToNotifications({
    audience: isAdmin ? "ADMIN" : "CUSTOMER",
    customerId: isAdmin ? null : Number(req.auth.sub),
    send,
  });

  // Keep the connection alive through proxies.
  const heartbeat = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) {
      res.write(": heartbeat\n\n");
    }
  }, 25000);

  const cleanup = () => {
    clearInterval(heartbeat);
    unsubscribe();
  };

  req.on("close", cleanup);
  res.on("close", cleanup);
}
