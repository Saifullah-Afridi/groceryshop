import pg from "pg";
import { env } from "../../config/env.js";

const { Client } = pg;
const CHANNEL = "rakan_notification_created";
const subscribers = new Set();
let listenerClient = null;
let reconnectTimer = null;
let reconnectDelay = 1000;
let stopping = false;
let connecting = false;
let listenerReady = false;

function sendEvent(response, event, payload = {}) {
  if (response.destroyed || response.writableEnded) return false;
  try {
    response.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
    return true;
  } catch {
    return false;
  }
}

export function subscribeToNotifications(response, audience, customerId = null) {
  const subscriber = { response, audience, customerId };
  subscribers.add(subscriber);
  sendEvent(response, listenerReady ? "ready" : "offline", { status: listenerReady ? "connected" : "listener-unavailable" });

  return () => {
    subscribers.delete(subscriber);
  };
}

function broadcastNotification(payload) {
  const audience = payload?.audience;
  const customerId = payload?.customerId == null ? null : Number(payload.customerId);
  if (!Number.isInteger(Number(payload?.id)) || !["ADMIN", "CUSTOMER"].includes(audience)) return;

  for (const subscriber of subscribers) {
    const isRecipient = audience === "ADMIN"
      ? subscriber.audience === "ADMIN"
      : subscriber.audience === "CUSTOMER" && subscriber.customerId === customerId;
    if (isRecipient) sendEvent(subscriber.response, "notification", { id: Number(payload.id) });
  }
}

function notifySubscribersListenerReady() {
  for (const subscriber of subscribers) {
    sendEvent(subscriber.response, "ready", { status: "database-listener-ready" });
  }
}

function scheduleReconnect() {
  if (stopping || reconnectTimer) return;
  const delay = reconnectDelay;
  reconnectDelay = Math.min(reconnectDelay * 2, 30000);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connectListener();
  }, delay);
  reconnectTimer.unref?.();
}

async function connectListener() {
  if (stopping || connecting) return;
  connecting = true;
  const connectionString = env.notificationDatabaseUrl;
  if (!connectionString) {
    console.error("Realtime notifications disabled: NOTIFICATION_DATABASE_URL or DATABASE_URL is missing.");
    connecting = false;
    scheduleReconnect();
    return;
  }

  const client = new Client({
    connectionString,
    application_name: "rakan-notification-listener",
    keepAlive: true,
    connectionTimeoutMillis: 10000,
  });
  listenerClient = client;
  let ended = false;
  const handleDisconnect = (error) => {
    if (ended) return;
    ended = true;
    if (listenerClient === client) listenerClient = null;
    listenerReady = false;
    for (const subscriber of subscribers) sendEvent(subscriber.response, "offline", { status: "listener-unavailable" });
    if (error) console.error("PostgreSQL notification listener disconnected:", error.message);
    if (!stopping) scheduleReconnect();
  };

  client.on("notification", (message) => {
    if (message.channel !== CHANNEL || !message.payload) return;
    try {
      broadcastNotification(JSON.parse(message.payload));
    } catch (error) {
      console.error("Invalid realtime notification payload:", error.message);
    }
  });
  client.on("error", handleDisconnect);
  client.on("end", () => handleDisconnect());

  try {
    await client.connect();
    if (stopping) {
      await client.end().catch(() => {});
      return;
    }
    await client.query(`LISTEN ${CHANNEL}`);
    reconnectDelay = 1000;
    listenerReady = true;
    console.log("PostgreSQL realtime notification listener connected.");
    notifySubscribersListenerReady();
  } catch (error) {
    handleDisconnect(error);
    await client.end().catch(() => {});
  } finally {
    connecting = false;
  }
}

export function startNotificationListener() {
  stopping = false;
  void connectListener();
}

export async function stopNotificationListener() {
  stopping = true;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  const client = listenerClient;
  listenerClient = null;
  listenerReady = false;
  if (client) await client.end().catch(() => {});
  for (const subscriber of subscribers) {
    subscriber.response.end();
  }
  subscribers.clear();
}
