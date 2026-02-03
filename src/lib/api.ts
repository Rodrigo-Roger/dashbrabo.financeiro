// Re-export all services from the organized service layer
export * from "@/services/user";
export * from "@/services/team";
export * from "@/services/dashboard";

// Maintain backward compatibility
export type { ApiRole } from "@/services/team";
export type {
  Discount,
  DiscountType,
  DiscountInstallment,
} from "@/services/dashboard";
