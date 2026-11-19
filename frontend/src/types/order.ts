export type OrderStatus = "PENDING" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  unit: string;
  unitPrice: number; // price per 0.25 kg (or per piece) when the order was placed
  quantity: number;
  lineTotal: number;
}

// Every amount on an order comes from the server. The browser never sends a price.
export interface Order {
  id: number;
  status: OrderStatus;
  name: string;
  phone: string;
  address: string;
  addressAr?: string;
  city: string;
  note: string;
  noteAr?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

// What the browser sends: which products, how much of each, and where to deliver.
export interface OrderInput {
  items: { productId: number; quantity: number }[];
  cityId: number;
  name: string;
  phone: string;
  address: string;
  note: string;
  language: "en" | "ar";
}

export interface City {
  id: number;
  name: string;
  fee: number;
  active: boolean;
}
export type CityInput = Omit<City, "id">;
