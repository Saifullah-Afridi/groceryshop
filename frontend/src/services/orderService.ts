import type { Order, OrderInput } from "../types/order";
import { api } from "./apiClient";

// The server works out every price and the delivery fee. We only say what we want and where to send it.
export const createOrder = (input: OrderInput) => api<Order>("/orders", { method: "POST", body: input, auth: "customer" });
export const getMyOrders = () => api<Order[]>("/orders/mine", { auth: "customer" });
export const cancelMyOrder = (id: number) => api<Order>(`/orders/${id}/cancel`, { method: "POST", auth: "customer" });
