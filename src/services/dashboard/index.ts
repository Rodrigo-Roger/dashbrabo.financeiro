export * from "./discountService";
export * from "./paymentService";

// Explicit exports for clarity
export { fetchPaymentHistory } from "./paymentService";
export {
  fetchDiscounts,
  getTotalDiscounts,
  createDiscount,
  fetchDiscountTypes,
} from "./discountService";
