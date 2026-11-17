const subscribers = new Set();

export function subscribeToNotifications(subscriber) {
  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
}

export function publishNotification(notification) {
  for (const subscriber of subscribers) {
    const isAdmin = notification.audience === "ADMIN";

    const matches =
      subscriber.audience === notification.audience &&
      (isAdmin || subscriber.customerId === notification.customerId);

    if (!matches) continue;

    try {
      subscriber.send({
        type: "notification",
        notificationId: notification.id,
      });
    } catch {
      subscribers.delete(subscriber);
    }
  }
}
