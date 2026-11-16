// import { Eye, Package, Search, ShoppingBag } from "lucide-react";
// import { useEffect, useState } from "react";

// import { TableSkeleton } from "../../components/Skeleton";
// import { inputClass } from "../../components/admin/FormField";
// import { Modal } from "../../components/admin/Modal";
// import { OrderDetails } from "../../components/admin/OrderDetails";
// import { PageHeader } from "../../components/admin/PageHeader";
// import { Pagination } from "../../components/admin/Pagination";
// import { Message } from "../../components/Message";

// import { useLanguage } from "../../context/LanguageContext";
// import { useAdminOrders, useSetOrderStatus } from "../../hooks/useAdmin";

// import type { Order, OrderStatus } from "../../types/order";

// import {
//   ORDER_STATUSES,
//   STATUS_STYLE,
//   statusKey,
// } from "../../utils/orderStatus";

// const PAGE_SIZE = 8;

// export function AdminOrdersPage() {
//   const { t, money, date, isArabic } = useLanguage();

//   const [status, setStatus] = useState<OrderStatus | "">("");
//   const [search, setSearch] = useState("");
//   const [viewing, setViewing] = useState<Order | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);

//   const { data: orders = [], isLoading } = useAdminOrders({
//     status: status || undefined,
//     q: search.trim() || undefined,
//   });

//   const setOrderStatus = useSetOrderStatus();

//   const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

//   const paginatedOrders = orders.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE,
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [status, search]);

//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
//     setOrderStatus.mutate({
//       id: orderId,
//       status: newStatus,
//     });
//   };

//   return (
//     <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
//       {/* Page heading */}
//       <PageHeader
//         title={t("admin.orders.title")}
//         text={t("admin.orders.text")}
//       />

//       {/* Orders overview */}
//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//         <div className="flex items-center gap-3 rounded-xl border border-edge bg-white px-4 py-4">
//           <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-brand">
//             <ShoppingBag size={20} />
//           </div>

//           <div>
//             <p className="text-xl font-semibold tracking-tight text-brand">
//               {orders.length}
//             </p>

//             <p className="mt-0.5 text-xs font-medium text-muted">
//               {t("admin.orders.count", {
//                 count: orders.length,
//               })}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 rounded-xl border border-edge bg-white px-4 py-4">
//           <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
//             <Package size={20} />
//           </div>

//           <div>
//             <p className="text-xl font-semibold tracking-tight text-brand">
//               {orders.filter((order) => order.status === "PENDING").length}
//             </p>

//             <p className="mt-0.5 text-xs font-medium text-muted">
//               {t("status.PENDING")}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Search and filters */}
//       <section className="rounded-xl border border-edge bg-white p-4">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//           {/* Search */}
//           <label className="relative min-w-0 flex-1 sm:max-w-md">
//             <Search
//               size={16}
//               className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
//             />

//             <input
//               type="search"
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//               placeholder={t("admin.orders.search")}
//               className={`${inputClass} h-11 ps-9`}
//             />
//           </label>

//           {/* Status filter */}
//           <select
//             value={status}
//             onChange={(event) =>
//               setStatus(event.target.value as OrderStatus | "")
//             }
//             className={`${inputClass} h-11 w-full sm:w-52`}
//             aria-label={t("admin.orders.filterStatus")}
//           >
//             <option value="">{t("admin.orders.allStatuses")}</option>

//             {ORDER_STATUSES.map((item) => (
//               <option key={item} value={item}>
//                 {t(statusKey(item))}
//               </option>
//             ))}
//           </select>

//           {/* Result count */}
//           <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted sm:ms-auto">
//             <span className="h-2 w-2 rounded-full bg-brand" />

//             {t("admin.orders.count", {
//               count: orders.length,
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Orders table */}
//       <section className="space-y-4">
//         <div className="flex flex-wrap items-center justify-between gap-2">
//           <div>
//             <h2 className="text-base font-semibold text-brand">
//               {t("admin.orders.title")}
//             </h2>

//             <p className="mt-1 text-xs text-muted">
//               {isArabic
//                 ? "عرض وإدارة جميع طلبات العملاء"
//                 : "View and manage all customer orders"}
//             </p>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="overflow-hidden rounded-xl border border-edge bg-white p-3">
//             <TableSkeleton />
//           </div>
//         ) : orders.length === 0 ? (
//           <div className="rounded-xl border border-edge bg-white p-6">
//             <Message
//               title={t("admin.orders.none")}
//               text={t("admin.orders.noneText")}
//             />
//           </div>
//         ) : (
//           <>
//             <div className="overflow-hidden rounded-xl border border-edge bg-white">
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[900px] text-sm">
//                   <thead>
//                     <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
//                       <th className="px-5 py-3.5 text-start">
//                         {t("admin.orders.colOrder")}
//                       </th>

//                       <th className="px-5 py-3.5 text-start">
//                         {t("admin.orders.colUser")}
//                       </th>

//                       <th className="px-5 py-3.5 text-start">
//                         {t("admin.orders.colCity")}
//                       </th>

//                       <th className="px-5 py-3.5 text-start">
//                         {t("admin.orders.colTotal")}
//                       </th>

//                       <th className="px-5 py-3.5 text-start">
//                         {t("admin.orders.colStatus")}
//                       </th>

//                       <th className="px-5 py-3.5 text-end">
//                         {t("admin.orders.colView")}
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody className="divide-y divide-edge">
//                     {paginatedOrders.map((order) => (
//                       <tr
//                         key={order.id}
//                         onClick={() => setViewing(order)}
//                         className="
//                           group cursor-pointer
//                           transition-colors duration-200
//                           hover:bg-surface/70
//                         "
//                       >
//                         {/* Order ID and date */}
//                         <td className="px-5 py-4">
//                           <p className="font-semibold text-brand transition-colors group-hover:text-brand-dark">
//                             #{order.id}
//                           </p>

//                           <p className="mt-1 text-xs text-muted">
//                             {date(order.createdAt)}
//                           </p>
//                         </td>

//                         {/* Customer */}
//                         <td className="px-5 py-4">
//                           <div className="flex items-center gap-3">
//                             <div
//                               className="
//                                 grid h-9 w-9 shrink-0
//                                 place-items-center rounded-full
//                                 border border-edge bg-surface
//                                 text-brand
//                                 transition-all duration-200
//                                 group-hover:border-brand
//                                 group-hover:bg-brand
//                                 group-hover:text-white
//                               "
//                             >
//                               <span className="text-xs font-semibold">
//                                 {order.name?.charAt(0)?.toUpperCase() || "?"}
//                               </span>
//                             </div>

//                             <div className="min-w-0">
//                               <p className="truncate font-medium text-brand">
//                                 {order.name}
//                               </p>

//                               <p
//                                 dir="ltr"
//                                 className="mt-0.5 text-start text-xs text-muted"
//                               >
//                                 {order.phone}
//                               </p>
//                             </div>
//                           </div>
//                         </td>

//                         {/* City */}
//                         <td className="px-5 py-4">
//                           <span className="font-medium text-gray-700">
//                             {order.city}
//                           </span>
//                         </td>

//                         {/* Total */}
//                         <td className="whitespace-nowrap px-5 py-4">
//                           <span className="font-semibold text-brand">
//                             {money(order.total)}
//                           </span>
//                         </td>

//                         {/* Status */}
//                         <td
//                           className="px-5 py-4"
//                           onClick={(event) => event.stopPropagation()}
//                         >
//                           <select
//                             value={order.status}
//                             disabled={setOrderStatus.isPending}
//                             onChange={(event) =>
//                               handleStatusChange(
//                                 order.id,
//                                 event.target.value as OrderStatus,
//                               )
//                             }
//                             aria-label={t("admin.orders.statusOf", {
//                               id: order.id,
//                             })}
//                             className={`
//                               max-w-[155px] cursor-pointer
//                               rounded-full border-0
//                               px-3 py-2 text-xs font-semibold
//                               outline-none transition-all
//                               focus:ring-2 focus:ring-brand
//                               disabled:cursor-not-allowed
//                               disabled:opacity-60
//                               ${STATUS_STYLE[order.status]}
//                             `}
//                           >
//                             {ORDER_STATUSES.map((item) => (
//                               <option key={item} value={item}>
//                                 {t(statusKey(item))}
//                               </option>
//                             ))}
//                           </select>
//                         </td>

//                         {/* View button */}
//                         <td className="px-5 py-4">
//                           <div className="flex justify-end">
//                             <button
//                               type="button"
//                               onClick={(event) => {
//                                 event.stopPropagation();
//                                 setViewing(order);
//                               }}
//                               aria-label={t("admin.orders.viewOrder", {
//                                 id: order.id,
//                               })}
//                               className="
//                                 grid h-9 w-9 cursor-pointer
//                                 place-items-center rounded-lg
//                                 border border-edge bg-white
//                                 text-muted
//                                 transition-all duration-200
//                                 hover:border-brand
//                                 hover:bg-brand
//                                 hover:text-white
//                                 active:scale-95
//                                 focus:outline-none
//                                 focus:ring-2 focus:ring-brand
//                                 focus:ring-offset-2
//                               "
//                             >
//                               <Eye size={16} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Pagination */}
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               totalItems={orders.length}
//               pageSize={PAGE_SIZE}
//               itemLabel="orders"
//               onPageChange={setCurrentPage}
//             />
//           </>
//         )}
//       </section>

//       {/* Order details modal */}
//       {viewing && (
//         <Modal
//           title={t("orders.orderNumber", {
//             id: viewing.id,
//           })}
//           onClose={() => setViewing(null)}
//           size="lg"
//         >
//           <OrderDetails
//             order={orders.find((order) => order.id === viewing.id) ?? viewing}
//           />
//         </Modal>
//       )}
//     </div>
//   );
// }

import { Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { TableSkeleton } from "../../components/Skeleton";
import { inputClass } from "../../components/admin/FormField";
import {
  ADMIN_ORDER_STATUSES,
  OrderDrawer,
} from "../../components/admin/OrderDrawer";
import { PageHeader } from "../../components/admin/PageHeader";
import { Pagination } from "../../components/admin/Pagination";
import { Message } from "../../components/Message";

import { useLanguage } from "../../context/LanguageContext";
import { useAdminOrders, useSetOrderStatus } from "../../hooks/useAdmin";

import type { OrderStatus } from "../../types/order";

import { STATUS_STYLE, statusKey } from "../../utils/orderStatus";

const PAGE_SIZE = 8;

export function AdminOrdersPage() {
  const { t, money, date, isArabic } = useLanguage();

  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch by search only, so the tab counts always match the search.
  const { data: allOrders = [], isLoading } = useAdminOrders({
    q: search.trim() || undefined,
  });

  const setOrderStatus = useSetOrderStatus();

  const countOf = (s: OrderStatus) =>
    allOrders.filter((order) => order.status === s).length;

  const orders = status
    ? allOrders.filter((order) => order.status === status)
    : allOrders;

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  const paginatedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Always read the live order, so the drawer updates after a status change
  const viewing = allOrders.find((order) => order.id === viewingId) ?? null;

  useEffect(() => {
    setCurrentPage(1);
  }, [status, search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    setOrderStatus.mutate({ id: orderId, status: newStatus });
  };

  const tabs: { value: OrderStatus | ""; label: string; count: number }[] = [
    {
      value: "",
      label: t("admin.orders.allStatuses"),
      count: allOrders.length,
    },
    ...ADMIN_ORDER_STATUSES.map((s) => ({
      value: s,
      label: t(statusKey(s)),
      count: countOf(s),
    })),
  ];

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5">
      <PageHeader
        title={t("admin.orders.title")}
        text={t("admin.orders.text")}
      />

      {/* Status tabs with counts */}
      <div className="flex gap-2 overflow-x-auto rounded-xl border border-edge bg-white p-2">
        {tabs.map((tab) => {
          const active = status === tab.value;

          return (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-brand text-white"
                  : "text-muted hover:bg-surface hover:text-brand"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active ? "bg-white/25 text-white" : "bg-surface text-brand"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <section className="rounded-xl border border-edge bg-white p-4">
        <label className="relative block">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("admin.orders.search")}
            className={`${inputClass} h-11 ps-9`}
          />
        </label>
      </section>

      {/* Orders table */}
      <section className="space-y-4">
        {isLoading ? (
          <div className="overflow-hidden rounded-xl border border-edge bg-white p-3">
            <TableSkeleton />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-edge bg-white p-6">
            <Message
              title={t("admin.orders.none")}
              text={t("admin.orders.noneText")}
            />
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-edge bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-edge bg-surface text-xs font-semibold text-muted">
                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colOrder")}
                      </th>
                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colUser")}
                      </th>
                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colCity")}
                      </th>
                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colTotal")}
                      </th>
                      <th className="px-5 py-3.5 text-start">
                        {t("admin.orders.colStatus")}
                      </th>
                      <th className="px-5 py-3.5 text-end">
                        {t("admin.orders.colView")}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-edge">
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setViewingId(order.id)}
                        className={`group cursor-pointer transition-colors duration-200 hover:bg-surface/70 ${
                          viewingId === order.id ? "bg-surface" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-brand">
                            #{order.id}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {date(order.createdAt)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-edge bg-surface text-brand transition-all duration-200 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                              <span className="text-xs font-semibold">
                                {order.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-medium text-brand">
                                {order.name}
                              </p>
                              <p
                                dir="ltr"
                                className="mt-0.5 text-start text-xs text-muted"
                              >
                                {order.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium text-gray-700">
                            {order.city}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-semibold text-brand">
                            {money(order.total)}
                          </span>
                        </td>

                        {/* Status: quick change, limited to the 4 statuses */}
                        <td
                          className="px-5 py-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <select
                            value={order.status}
                            disabled={setOrderStatus.isPending}
                            onChange={(event) =>
                              handleStatusChange(
                                order.id,
                                event.target.value as OrderStatus,
                              )
                            }
                            aria-label={t("admin.orders.statusOf", {
                              id: order.id,
                            })}
                            className={`max-w-[155px] cursor-pointer rounded-full border-0 px-3 py-2 text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLE[order.status]}`}
                          >
                            {ADMIN_ORDER_STATUSES.map((item) => (
                              <option key={item} value={item}>
                                {t(statusKey(item))}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setViewingId(order.id);
                              }}
                              aria-label={t("admin.orders.viewOrder", {
                                id: order.id,
                              })}
                              className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-edge bg-white text-muted transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 active:scale-95"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={orders.length}
              pageSize={PAGE_SIZE}
              itemLabel="orders"
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>

      {/* Order details drawer (replaces the old modal) */}
      {viewing && (
        <OrderDrawer
          order={viewing}
          onClose={() => setViewingId(null)}
          onStatusChange={handleStatusChange}
          isUpdating={setOrderStatus.isPending}
        />
      )}
    </div>
  );
}
