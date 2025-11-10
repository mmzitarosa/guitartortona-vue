import type { Bank } from '@/types/bank.ts'

export interface LedgerEntry {
  id?: number;
  date?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  description?: string;
  reason?: string;
  paymentMethod?: 'BANK' | 'CASH';
  bank?: Bank;
  paymentType?: 'DEPOSIT' | 'BALANCE';
  receiptNumber?: string;
  movementType?: 'INCOME' | 'EXPENSE';
  amount?: number;
  notes?: string;
}

export interface ValueLabel {value: string, label: string, icon?: string, style?: string, char?: string}

export const paymentTypes: ValueLabel[] = [{value: 'BALANCE', label: 'Saldo', char: 'S'}, {value: 'DEPOSIT', label: 'Acconto', char: 'A'}]
export const paymentTypesMap: Record<string, {label: string, char?: string}> = paymentTypes.reduce((acc, {value, label, char}) => {
  acc[value] = {label, char}
  return acc
}, {} as Record<string, {label: string, char?: string}>)

export const paymentMethods: ValueLabel[] = [{value: 'CASH', label: 'Cassa', icon: 'pi pi-money-bill'}, {value: 'BANK', label: 'Banca', icon: 'pi pi-building-columns'}]
export const paymentMethodsMap: Record<string, {label: string, icon?: string}> = paymentMethods.reduce((acc, {value, label, icon}) => {
  acc[value] = {label, icon}
  return acc
}, {} as Record<string, {label: string, icon?: string}>)

export const movementTypes: ValueLabel[] = [{value: 'INCOME', label: 'Entrata', char:'', style: 'text-green-500'}, {value: 'EXPENSE', label: 'Uscita', char: '-', style: 'text-primary-500'}]
export const movementTypesMap: Record<string, {label: string, char?: string, style?: string}> = movementTypes.reduce((acc, {value, label, char, style}) => {
  acc[value] = {label, char, style}
  return acc
}, {} as Record<string, {label: string, char?: string, style?: string}>)

export interface LedgerEntryDTO {
  id?: number;
  date?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  description?: string;
  reason?: string;
  paymentMethod?: 'BANK' | 'CASH';
  bank?: Bank;
  bankId?: number;
  paymentType?: 'DEPOSIT' | 'BALANCE';
  receiptNumber?: string;
  movementType?: 'INCOME' | 'EXPENSE';
  amount?: number;
  notes?: string;
}
