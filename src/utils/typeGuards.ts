import type { Supplier } from '@/types/supplier.ts'

export function isSupplier(obj: unknown): obj is Supplier {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    typeof obj.id === "number" &&
    typeof obj.name === "string"
  );
}
