import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import i18n from "../i18n";
import { cancelMyOrder, createOrder, getMyOrders } from "../services/orderService";
import type { Order, OrderInput } from "../types/order";

// Order data is refreshed immediately by the shared Supabase Realtime notification listener.
export const useMyOrders = (enabled: boolean) =>
  useQuery({ queryKey: ["orders", "mine"], queryFn: getMyOrders, enabled });

export function usePlaceOrder() {
  const client = useQueryClient();
  return useMutation<Order, Error, OrderInput>({
    mutationFn: createOrder,
    onSuccess: () => client.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCancelMyOrder() {
  const client = useQueryClient();
  return useMutation<Order, Error, number>({
    mutationFn: cancelMyOrder,
    onSuccess: (order) => {
      client.invalidateQueries({ queryKey: ["orders"] });
      toast.success(i18n.t("orders.cancelled", { id: order.id }));
    },
  });
}
