export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Remove duplicatas de um array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Ordena um array de objetos por uma chave
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc",
): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA < valueB) return order === "asc" ? -1 : 1;
    if (valueA > valueB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Calcula a soma de valores de uma propriedade em um array de objetos
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

/**
 * Encontra o valor máximo de uma propriedade em um array de objetos
 */
export function maxBy<T>(array: T[], key: keyof T): number | undefined {
  if (array.length === 0) return undefined;
  return Math.max(
    ...array.map(
      (item) => (typeof item[key] === "number" ? item[key] : 0) as number,
    ),
  );
}

/**
 * Encontra o valor mínimo de uma propriedade em um array de objetos
 */
export function minBy<T>(array: T[], key: keyof T): number | undefined {
  if (array.length === 0) return undefined;
  return Math.min(
    ...array.map(
      (item) => (typeof item[key] === "number" ? item[key] : 0) as number,
    ),
  );
}

/**
 * Calcula a média de valores de uma propriedade em um array de objetos
 */
export function averageBy<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0;
  return sumBy(array, key) / array.length;
}
