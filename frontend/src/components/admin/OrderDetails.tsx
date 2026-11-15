import { Check, MapPin, PackageCheck } from "lucide-react";

import type { Unit } from "../../types";
import type { Order } from "../../types/order";

import { useLanguage } from "../../context/LanguageContext";
import { amountLabel } from "../../utils/format";
import { STATUS_STYLE, statusKey } from "../../utils/orderStatus";

interface OrderDetailsProps {
  order: Order;
  onClose?: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const { t, money, unitName, date, isArabic } = useLanguage();

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-4 text-sm">
      {/* 1. Order Number & Metadata Card */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gray-200/90 bg-white text-gray-700 shadow-xs">
          <PackageCheck
            size={32}
            strokeWidth={1.8}
            className="text-emerald-600"
          />
        </div>

        <div className="text-end">
          <p className="text-lg font-medium text-gray-800">
            {isArabic ? "طلب" : "Order"}{" "}
            <span className="font-bold text-gray-950">#{order.id}</span>
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {isArabic ? "تاريخ الإصدار:" : "Issue date:"}{" "}
            <span className="font-semibold text-gray-800">
              {date(order.createdAt)}
            </span>
          </p>

          <div className="mt-1.5 flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <span>{isArabic ? "الحالة:" : "Status:"}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[order.status]}`}
            >
              {t(statusKey(order.status))}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Order Details Card (Products & Totals) */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        {/* Product Table Header Strip */}
        <div className="grid grid-cols-12 bg-gray-200/80 px-5 py-2.5 text-sm font-semibold text-gray-700">
          <div className="col-span-6 text-start">{t("admin.od.product")}</div>
          <div className="col-span-3 text-center">
            {isArabic ? "الكمية" : "Qty"}
          </div>
          <div className="col-span-3 text-end">
            {isArabic ? "السعر" : "Price"}
          </div>
        </div>

        {/* Product Rows */}
        <div className="divide-y divide-gray-100 px-5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center py-3.5 text-sm text-gray-800"
            >
              <div className="col-span-6 break-words text-start font-medium">
                {item.productName}
              </div>

              <div className="col-span-3 text-center text-gray-700">
                {amountLabel(
                  item.quantity,
                  item.unit as Unit,
                  unitName(item.unit),
                )}
              </div>

              <div className="col-span-3 text-end font-semibold text-gray-900">
                {money(item.lineTotal)}
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal, Delivery & Total Row */}
        <div className="border-t border-gray-200 px-5 py-4">
          <div className="mb-2.5 space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
              <span className="font-medium text-gray-700">
                {money(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                {isArabic
                  ? `التوصيل إلى ${order.city}`
                  : `Delivery to ${order.city}`}
              </span>
              <span className="font-medium text-gray-700">
                {money(order.deliveryFee)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-lg font-bold text-gray-900">
            <span>{t("admin.orders.colTotal")}</span>
            <span>{money(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Delivery To Section */}
      <div className="overflow-hidden rounded-xl bg-gray-100/90 px-5 py-4 text-start">
        <div className="flex items-center gap-1.5 text-base font-semibold text-[#55b368]">
          <MapPin size={18} className="fill-[#55b368] text-white" />
          <span>{isArabic ? "التوصيل إلى" : "Delivery to"}</span>
        </div>

        <p className="mt-2 text-sm text-gray-700">
          {order.name}, {order.address}, {order.city}
        </p>

        <p className="mt-1.5 text-sm font-bold text-gray-800">
          {isArabic ? "الجوال -" : "Mobile -"}{" "}
          <a href={`tel:${order.phone}`} dir="ltr" className="hover:underline">
            {order.phone}
          </a>
        </p>

        {order.note && (
          <p className="mt-2.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs italic text-gray-600">
            {t("admin.od.note", { note: order.note })}
          </p>
        )}
      </div>

      {/* Bottom Green DONE Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#55b368] py-3.5 text-base font-bold tracking-wide text-white shadow-sm transition hover:bg-[#499e5b] active:scale-[0.99]"
        >
          <span>{isArabic ? "تم" : "DONE"}</span>
          <Check size={20} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
