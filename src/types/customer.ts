export interface Customer {
  id?: number
  firstName?: string
  lastName?: string
  address?: string
  zipCode?: string
  city?: string
  province?: string
  documentType?: string
  documentNumber?: string
  taxCode?: string
}

export type CustomerOption = Customer & { fullName: string }

export function customerFullName(customer?: Customer): string {
  return [customer?.lastName, customer?.firstName].filter(Boolean).join(' ')
}

export function withFullName(customer: Customer): CustomerOption {
  return { ...customer, fullName: customerFullName(customer) }
}

export function toCustomerDTO(customer: Customer): Customer {
  const { id, firstName, lastName, address, zipCode, city, province } = customer
  return {
    id,
    firstName,
    lastName,
    address,
    zipCode,
    city,
    province,
    documentType: customer.documentType || undefined,
    documentNumber: customer.documentNumber || undefined,
    taxCode: customer.taxCode || undefined,
  }
}
