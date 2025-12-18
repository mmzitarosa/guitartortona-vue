import apiClient from '@/services/api/apiClient.ts'
import type { LedgerEntry, LedgerEntryDTO, LedgerEntryLight } from '@/types/ledgerEntry.ts'
import { fromDTO, fromLightDTO, toDTO } from '@/utils/mapper/ledgerMapper.ts'
import { API_CONFIG } from '@/config/api.ts'
import type { ProductDTO } from '@/types/product.ts'

//Create
export async function postLedgerEntry(ledgerEntry: LedgerEntry): Promise<LedgerEntry> {
  const { data } = await apiClient.post('/ledgerEntry', toDTO(ledgerEntry))
  return fromDTO(data)
}

//Read
export async function getLedgerEntryById(id: number): Promise<LedgerEntry> {
  const { data } = await apiClient.get(`/ledgerEntry/${id}`)
  return fromDTO(data)
}

export async function getLedger(year: number): Promise<LedgerEntryLight[]> {
  const { data } = await apiClient.get(`/ledger`, { params: { year } })
  return data.flatMap((dto: LedgerEntryDTO) => fromLightDTO(dto))
}

//Update
export async function putLedgerEntryById(
  id: number,
  ledgerEntry: LedgerEntry,
): Promise<LedgerEntry> {
  const { data } = await apiClient.put(`/ledgerEntry/${id}`, toDTO(ledgerEntry))
  return fromDTO(data)
}

//Detele
export async function deleteLedgerEntryById(id: number): Promise<void> {
  await apiClient.delete(`/ledgerEntry/${id}`)
}

export function print(fromDate: string, toDate: string) {
  window.open(
    API_CONFIG.baseURL + '/api/v1/ledger/print?from=' + fromDate + '&to=' + toDate,
    '_blank',
  )
}
