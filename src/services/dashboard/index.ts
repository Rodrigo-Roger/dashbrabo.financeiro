import api from "@/lib/api_config";

export * from "./discountService";
export * from "./paymentService";

export async function syncMoskitData(vendedorId?: string): Promise<void> {
  const payload = vendedorId ? { vendedor_id: vendedorId } : undefined;
  await api.post("/moskit/v1/dashboard-summary/sync/", payload);
}

// Explicit exports for clarity
export { fetchPaymentHistory } from "./paymentService";
export {
  fetchDiscounts,
  getTotalDiscounts,
  createDiscount,
  fetchDiscountTypes,
} from "./discountService";
