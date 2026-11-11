import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { toast } from "react-toastify";

import { MAX_ORDER_QUANTITY } from "../config";
import { useCustomerAuth } from "./CustomerAuthContext";
import { useLanguage } from "./LanguageContext";
import type { CartItem, Product, Unit } from "../types";
import {
  amountLabel,
  clampDiscount,
  grossTotal,
  lineTotal,
  minAmountFor,
  roundAmount,
  stepFor,
} from "../utils/format";
import { localizedName } from "../utils/localized";

interface CartValue {
  items: CartItem[];
  count: number;
  /** What the shopper pays for the products: after discounts, before delivery */
  subtotal: number;
  /** The same products before discounts */
  grossSubtotal: number;
  /** grossSubtotal - subtotal */
  savings: number;
  addItem: (product: Product, amount?: number) => void;
  setAmount: (productId: number, amount: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  emptyCart: () => void; // clears the cart without a toast (used after an order is placed)
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartValue | null>(null);
const KEY = "rakan-cart";

// Carts saved by older versions are normalised to the current discount and quarter-step rules.
function readSavedCart(): CartItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved.map((item) => ({
      ...item,
      discount: clampDiscount(item.discount),
      minQuantity: minAmountFor({ unit: item.unit as Unit, minQuantity: item.minQuantity }),
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { customer, openAuth } = useCustomerAuth();
  const { t, language, unitName } = useLanguage();
  const [items, setItems] = useState<CartItem[]>(readSavedCart);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const commitAdd = (product: Product, requested: number) => {
    // Every product starts at one selectable step; admin stock alerts never affect order quantity.
    const min = minAmountFor(product);
    const amount = roundAmount(Math.max(requested, min));

    setItems((list) => {
      const existingItem = list.find((item) => item.productId === product.id);

      if (existingItem) {
        return list.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                // the latest price and discount win, in case the admin changed them
                price: product.price,
                discount: clampDiscount(product.discount),
                minQuantity: min,
                amount: Math.min(MAX_ORDER_QUANTITY, roundAmount(item.amount + amount)),
              }
            : item,
        );
      }

      return [
        ...list,
        {
          productId: product.id,
          name: product.name,
          nameAr: product.nameAr,
          price: product.price,
          discount: clampDiscount(product.discount),
          minQuantity: min,
          unit: product.unit,
          amount,
          image: product.image,
        },
      ];
    });

    toast.success(t("cart.added", { name: localizedName(product, language) }));
    // Do not open the drawer when a product is added.
  };

  // Shoppers must be signed in to add to the cart. If not, ask them to sign in first,
  // then add the product as soon as they are done.
  const addItem = (product: Product, amount = minAmountFor(product)) => {
    if (!customer) {
      openAuth(() => commitAdd(product, amount));
      return;
    }
    commitAdd(product, amount);
  };

  const notifyRemoved = (productId: number) => {
    const item = items.find((entry) => entry.productId === productId);
    if (item) toast.info(t("cart.removed", { name: localizedName(item, language) }));
  };

  const setAmount = (productId: number, amount: number) => {
    if (amount <= 0) notifyRemoved(productId);
    setItems((list) =>
      amount <= 0
        ? list.filter((item) => item.productId !== productId)
        : list.map((item) => {
            if (item.productId !== productId) return item;
            // Keep the quantity at one quarter kilo / one selling unit minimum.
            const min = minAmountFor(item);
            if (amount < min - 1e-9) {
              toast.info(
                t("cart.minToast", {
                  name: localizedName(item, language),
                  amount: amountLabel(min, item.unit, unitName(item.unit)),
                }),
                { toastId: `min-${productId}` },
              );
              return { ...item, amount: min };
            }
            return { ...item, amount: Math.min(MAX_ORDER_QUANTITY, roundAmount(amount)) };
          }),
    );
  };

  const removeItem = (productId: number) => {
    notifyRemoved(productId);
    setItems((list) => list.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    if (items.length > 0) toast.info(t("cart.cleared"));
    setItems([]);
  };

  const emptyCart = () => setItems([]);

  const subtotal = items.reduce(
    (sum, item) => sum + lineTotal(item.price, item.amount, item.unit, item.discount),
    0,
  );
  const grossSubtotal = items.reduce(
    (sum, item) => sum + grossTotal(item.price, item.amount, item.unit),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.length,
        subtotal,
        grossSubtotal,
        savings: Math.max(0, grossSubtotal - subtotal),
        addItem,
        setAmount,
        removeItem,
        clearCart,
        emptyCart,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

// Re-exported so the drawer steps quantity the same way the cart validates it
export { stepFor };
