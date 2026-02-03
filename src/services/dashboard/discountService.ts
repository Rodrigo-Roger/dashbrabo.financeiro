import api from "@/lib/api_config";

export interface DiscountInstallment {
  id: string;
  installment_number: number;
  amount: number;
  reference_month: string;
  is_processed: boolean;
}

export interface Discount {
  id?: string;
  seller: string;
  discount_type: string;
  reference_month: string;
  amount: number;
  installments_count: number;
  notes?: string;
  is_active?: boolean;
  seller_name?: string;
  discount_type_name?: string;
  discount_type_code?: string;
  total_discount?: string;
  created_at?: string;
  updated_at?: string;
  installments?: DiscountInstallment[];
}

export interface DiscountType {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_type_display: string;
  fixed_amount: string | null;
  requires_quantity: boolean;
  is_active: boolean;
}

/**
 * Busca descontos de um vendedor
 */
export async function fetchDiscounts(
  employeeIdOrMoskitId: string,
): Promise<Discount[]> {
  const response = await api.get("/moskit/v1/discounts/", {
    params: { seller: employeeIdOrMoskitId },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
}

/**
 * Calcula o total de descontos de um vendedor
 */
export async function getTotalDiscounts(employeeId: string): Promise<number> {
  try {
    const discounts = await fetchDiscounts(employeeId);
    return discounts.reduce((sum, discount) => {
      const amount = Number(discount.total_discount || 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  } catch (error) {
    return 0;
  }
}

/**
 * Cria um novo desconto
 */
export async function createDiscount(discount: Discount): Promise<Discount> {
  const payload = Object.fromEntries(
    Object.entries(discount).filter(([, v]) => v !== undefined && v !== null),
  );
  const response = await api.post("/moskit/v1/discounts/", payload);
  return response.data;
}

/**
 * Busca tipos de descontos disponíveis
 */
export async function fetchDiscountTypes(): Promise<DiscountType[]> {
  const response = await api.get("/moskit/v1/discount-types/");
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
}
