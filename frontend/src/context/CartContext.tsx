import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { toast } from "react-toastify";

import { useCustomerAuth } from "./CustomerAuthContext";
import type { CartItem, Product } from "../types";

interface CartValue {
  items: CartItem[];
  count: number;
  subtotal: number;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { customer, openAuth } = useCustomerAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const commitAdd = (product: Product, amount: number) => {
    setItems((list) => {
      const existingItem = list.find((item) => item.productId === product.id);

      if (existingItem) {
        return list.map((item) =>
          item.productId === product.id
            ? { ...item, amount: item.amount + amount }
            : item,
        );
      }

      return [
        ...list,
        {
          productId: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          unit: product.unit,
          amount,
          image: product.image,
        },
      ];
    });

    toast.success(`${product.name} added to cart`);
    // Do not open the drawer when a product is added.
  };

  // Shoppers must be signed in to add to the cart. If not, ask them to sign in first,
  // then add the product as soon as they are done.
  const addItem = (product: Product, amount = 1) => {
    if (!customer) {
      openAuth(() => commitAdd(product, amount));
      return;
    }
    commitAdd(product, amount);
  };

  const notifyRemoved = (productId: number) => {
    const item = items.find((entry) => entry.productId === productId);
    if (item) toast.info(`${item.name} removed from cart`);
  };

  const setAmount = (productId: number, amount: number) => {
    if (amount <= 0) notifyRemoved(productId);
    setItems((list) =>
      amount <= 0
        ? list.filter((item) => item.productId !== productId)
        : list.map((item) =>
            item.productId === productId ? { ...item, amount } : item,
          ),
    );
  };

  const removeItem = (productId: number) => {
    notifyRemoved(productId);
    setItems((list) => list.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    if (items.length > 0) toast.info("Cart cleared");
    setItems([]);
  };

  const emptyCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => {
    const lineTotal =
      item.unit === "kg"
        ? item.price * (item.amount / 0.25)
        : item.price * item.amount;

    return sum + lineTotal;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.length,
        subtotal,
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
