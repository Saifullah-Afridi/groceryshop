export const FREE_DELIVERY_OVER = 10; // JOD, change when the real rule is decided
export const STORE = {
  name: "Rakan",
  city: "Irbid, Jordan",
  hours: "Open daily 7:00 AM to midnight",
  phone: "+962 2 724 5678",
  // The contact form opens the visitor's email app with the message addressed to this email.
  // PLACEHOLDER: replace it with the store's real email address.
  contactEmail: "contact@rakan.example",
};

// The most of one product in one order (kg, or pieces). The API enforces the same number (api/src/modules/orders/orders.validation.js).
export const MAX_ORDER_QUANTITY = 50;
