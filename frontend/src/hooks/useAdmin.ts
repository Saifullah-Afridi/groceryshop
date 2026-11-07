import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createCategory, createCity, createCustomer, createProduct, deleteCategory, deleteCity, deleteCustomer, deleteProduct,
  getAdminCategories, getAdminCities, getAdminCustomers, getAdminOrders, getAdminProducts,
  updateCategory, updateCity, updateCustomer, updateOrderStatus, updateProduct,
} from "../services/adminService";
import type { CategoryInput, ProductInput } from "../types/admin";
import type { CustomerInput } from "../types/customer";
import type { CityInput, OrderStatus } from "../types/order";
import { STATUS_LABEL } from "../utils/orderStatus";

export const useAdminCategories = () => useQuery({ queryKey: ["admin", "categories"], queryFn: getAdminCategories });
export const useAdminProducts = () => useQuery({ queryKey: ["admin", "products"], queryFn: getAdminProducts });

// After any change: reload the admin lists and show a toast with the result.
function useChange<V>(run: (v: V) => Promise<unknown>, successMessage: (v: V) => string) {
  const client = useQueryClient();
  return useMutation<unknown, Error, V>({
    mutationFn: run,
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["admin"] });
      toast.success(successMessage(variables));
    },
    onError: (error) => toast.error(error.message),
  });
}

// id missing = create, id present = update
export const useSaveCategory = () =>
  useChange(
    ({ id, input, imageFile }: { id?: string; input: CategoryInput; imageFile?: File | null }) =>
      id ? updateCategory(id, input, imageFile) : createCategory(input, imageFile),
    ({ id }) => (id ? "Category updated" : "Category created"),
  );

export const useDeleteCategory = () => useChange((id: string) => deleteCategory(id), () => "Category deleted");

export const useSaveProduct = () =>
  useChange(
    ({ id, input, imageFile }: { id?: number; input: ProductInput; imageFile?: File | null }) =>
      id ? updateProduct(id, input, imageFile) : createProduct(input, imageFile),
    ({ id }) => (id ? "Product updated" : "Product created"),
  );

export const useDeleteProduct = () => useChange((id: number) => deleteProduct(id), () => "Product deleted");

// ---------- delivery cities ----------
export const useAdminCities = () => useQuery({ queryKey: ["admin", "cities"], queryFn: getAdminCities });
export const useSaveCity = () =>
  useChange(
    ({ id, input }: { id?: number; input: CityInput }) => (id ? updateCity(id, input) : createCity(input)),
    ({ id }) => (id ? "City updated" : "City added"),
  );
export const useDeleteCity = () => useChange((id: number) => deleteCity(id), () => "City deleted");

// ---------- customers ----------
export const useAdminCustomers = () => useQuery({ queryKey: ["admin", "customers"], queryFn: getAdminCustomers });
export const useSaveCustomer = () =>
  useChange(
    ({ id, input }: { id?: number; input: CustomerInput }) => (id ? updateCustomer(id, input) : createCustomer(input)),
    ({ id }) => (id ? "User updated" : "User created"),
  );
export const useDeleteCustomer = () => useChange((id: number) => deleteCustomer(id), () => "User deleted");

// ---------- orders ----------
export const useAdminOrders = (query: { status?: OrderStatus; q?: string }) =>
  useQuery({
    queryKey: ["admin", "orders", query],
    queryFn: () => getAdminOrders(query),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000, // new orders show up without a refresh
  });
export const useSetOrderStatus = () =>
  useChange(
    ({ id, status }: { id: number; status: OrderStatus }) => updateOrderStatus(id, status),
    ({ id, status }) => `Order #${id}: ${STATUS_LABEL[status]}`,
  );
