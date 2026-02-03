export interface DiscountDateFilter {
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface DiscountLike {
  created_at?: string;
  installments_count?: number;
  total_discount?: string;
}

export interface DiscountInstallmentView {
  currentInstallment: number;
  totalInstallments: number;
  value: number;
  totalValue: number;
}

const toDate = (input?: string | Date | null): Date | null => {
  if (!input) return null;
  return input instanceof Date ? input : new Date(input);
};

export function getDiscountInstallments(
  discount: DiscountLike,
  dateFilter?: DiscountDateFilter,
): DiscountInstallmentView[] {
  if (!discount.created_at) return [];

  const installmentsCount = discount.installments_count || 1;
  const totalAmount = Number(discount.total_discount || 0);
  const installmentValue = totalAmount / installmentsCount;

  const createdDate = new Date(discount.created_at);
  const filterStart = toDate(dateFilter?.startDate);
  const filterEnd = toDate(dateFilter?.endDate);

  const installments: DiscountInstallmentView[] = [];

  for (let i = 0; i < installmentsCount; i++) {
    const installmentDate = new Date(createdDate);
    installmentDate.setMonth(installmentDate.getMonth() + i);

    if (!filterStart || !filterEnd) {
      installments.push({
        currentInstallment: i + 1,
        totalInstallments: installmentsCount,
        value: installmentValue,
        totalValue: totalAmount,
      });
      continue;
    }

    const installmentMonth = new Date(
      installmentDate.getFullYear(),
      installmentDate.getMonth(),
      1,
    );
    const installmentMonthEnd = new Date(
      installmentDate.getFullYear(),
      installmentDate.getMonth() + 1,
      0,
    );

    if (installmentMonth <= filterEnd && installmentMonthEnd >= filterStart) {
      installments.push({
        currentInstallment: i + 1,
        totalInstallments: installmentsCount,
        value: installmentValue,
        totalValue: totalAmount,
      });
    }
  }

  return installments;
}

export function getDiscountTotal(
  discounts: DiscountLike[],
  dateFilter?: DiscountDateFilter,
): number {
  return discounts
    .flatMap((discount) => getDiscountInstallments(discount, dateFilter))
    .reduce((sum, installment) => sum + installment.value, 0);
}
