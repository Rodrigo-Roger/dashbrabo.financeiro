/**
 * Formata um valor numérico como moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um valor numérico como percentual
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Formata uma data para formato brasileiro (dd/MM/yyyy)
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
}

/**
 * Formata uma data para formato ISO (yyyy-MM-dd)
 */
export function formatDateISO(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}

/**
 * Obtém o mês e ano atual no formato yyyy-MM
 */
export function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Obtém apenas o mês atual (01-12)
 */
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(5, 7);
}

/**
 * Obtém o ano atual
 */
export function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}

/**
 * Lista de meses em português
 */
export const MONTHS = [
  { value: "01", label: "janeiro" },
  { value: "02", label: "fevereiro" },
  { value: "03", label: "março" },
  { value: "04", label: "abril" },
  { value: "05", label: "maio" },
  { value: "06", label: "junho" },
  { value: "07", label: "julho" },
  { value: "08", label: "agosto" },
  { value: "09", label: "setembro" },
  { value: "10", label: "outubro" },
  { value: "11", label: "novembro" },
  { value: "12", label: "dezembro" },
] as const;
