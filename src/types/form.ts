//Per Resolver
import type { Supplier } from '@/types/supplier.ts'

export interface FieldError {
  message: string
}

export interface ResolverResult {
  errors: Record<string, FieldError[]>
}

//Per Costanti
export interface CardConst {
  title?: string
  subtitle?: string
}

export interface FieldConst {
  label: string
  messages: {
    required?: string
    tooLong?: string
    other?: string
  }
}

export interface ButtonConst {
  label?: string
  icon: string
}

export interface DialogConst {
  title: string
  message: string
  icon: string
  acceptLabel: string
  rejectLabel: string
  toastTitle?: string
  toastMessage?: string
}
