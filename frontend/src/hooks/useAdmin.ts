import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createCategory,
  createCity,
  createCustomer,
  createProduct,
  deleteCategory,
  deleteCity,
  deleteCustomer,
  deleteProduct,
  getAdminCategories,
  type AdminListQuery,
  getAdminCities,
  getAdminCustomers,
  getAdminCustomer,
  getAdminOrders,
  getAdminProducts,
  getDashboard,
  updateCategory,
  updateCity,
  updateCustomer,
  updateOrderStatus,
  updateProduct,
  restoreProduct,
} from "../services/adminService";
import type { CategoryInput, ProductInput } from "../types/admin";
import type { CustomerInput } from "../types/customer";
import type { CityInput, OrderStatus } from "../types/order";
import i18n from "../i18n";
import { statusKey } from "../utils/orderStatus";

export const useAdminCategories = (query: AdminListQuery) =>
  useQuery({ queryKey: ["admin", "categories", query], queryFn: () => getAdminCategories(query), placeholderData: keepPreviousData });
export const useAdminProducts = (query: AdminListQuery) =>
  useQuery({ queryKey: ["admin", "products", query], queryFn: () => getAdminProducts(query), placeholderData: keepPreviousData });

// After any change: reload the admin lists and show a toast with the result.
function useChange<V>(
  run: (v: V) => Promise<unknown>,
  successMessage: (v: V) => string,
) {
  const client = useQueryClient();
  return useMutation<unknown, Error, V>({
    mutationFn: run,
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["admin"] });
      // the shop reads its own copies of this data, so refresh those as well
      client.invalidateQueries({ queryKey: ["products"] });
      client.invalidateQueries({ queryKey: ["product"] });
      client.invalidateQueries({ queryKey: ["categories"] });
      client.invalidateQueries({ queryKey: ["cities"] });
      toast.success(successMessage(variables));
    },
    onError: (error) => toast.error(error.message),
  });
}

// id missing = create, id present = update
export const useSaveCategory = () =>
  useChange(
    ({
      id,
      input,
      imageFile,
    }: {
      id?: string;
      input: CategoryInput;
      imageFile?: File | null;
    }) =>
      id
        ? updateCategory(id, input, imageFile)
        : createCategory(input, imageFile),
    ({ id }) => i18n.t(id ? "admin.categories.updated" : "admin.categories.created"),
  );

export const useDeleteCategory = () =>
  useChange(
    (id: string) => deleteCategory(id),
    () => i18n.t("admin.categories.deleted"),
  );

export const useSaveProduct = () =>
  useChange(
    ({
      id,
      input,
      imageFile,
    }: {
      id?: number;
      input: ProductInput;
      imageFile?: File | null;
    }) =>
      id
        ? updateProduct(id, input, imageFile)
        : createProduct(input, imageFile),
    ({ id }) => i18n.t(id ? "admin.products.updated" : "admin.products.created"),
  );

export const useDeleteProduct = () =>
  useChange(
    (id: number) => deleteProduct(id),
    () => "Product moved to archive.",
  );
export const useRestoreProduct = () =>
  useChange(
    (id: number) => restoreProduct(id),
    () => "Product restored to the active product list.",
  );

// ---------- delivery cities ----------
export const useAdminCities = (query: AdminListQuery) =>
  useQuery({ queryKey: ["admin", "cities", query], queryFn: () => getAdminCities(query), placeholderData: keepPreviousData });
export const useSaveCity = () =>
  useChange(
    ({ id, input }: { id?: number; input: CityInput }) =>
      id ? updateCity(id, input) : createCity(input),
    ({ id }) => i18n.t(id ? "admin.cities.updated" : "admin.cities.added"),
  );
export const useDeleteCity = () =>
  useChange(
    (id: number) => deleteCity(id),
    () => i18n.t("admin.cities.deleted"),
  );

// ---------- customers ----------
export const useAdminCustomers = (query: AdminListQuery) =>
  useQuery({ queryKey: ["admin", "customers", query], queryFn: () => getAdminCustomers(query), placeholderData: keepPreviousData });
export const useAdminCustomer = (id: number, query: AdminListQuery) =>
  useQuery({
    queryKey: ["admin", "customers", id, query],
    queryFn: () => getAdminCustomer(id, query),
    enabled: Number.isInteger(id) && id > 0,
  });
export const useSaveCustomer = () =>
  useChange(
    ({ id, input }: { id?: number; input: CustomerInput }) =>
      id ? updateCustomer(id, input) : createCustomer(input),
    ({ id }) => i18n.t(id ? "admin.users.updated" : "admin.users.created"),
  );
export const useDeleteCustomer = () =>
  useChange(
    (id: number) => deleteCustomer(id),
    () => i18n.t("admin.users.deleted"),
  );

// ---------- orders ----------
export const useAdminOrders = (query: AdminListQuery) =>
  useQuery({
    queryKey: ["admin", "orders", query],
    queryFn: () => getAdminOrders(query),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000, // new orders show up without a refresh
  });
export const useSetOrderStatus = () =>
  useChange(
    ({ id, status }: { id: number; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    ({ id, status }) => i18n.t("admin.orders.statusChanged", { id, status: i18n.t(statusKey(status)) }),
  );

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
    refetchInterval: 60_000,
  });
