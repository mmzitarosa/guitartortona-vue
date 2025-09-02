import apiClient from '@/services/api/apiClient.ts'
import type { LedgerEntry } from '@/types/ledgerEntry.ts'
import { fromDTO, fromDTOPage, toDTO } from '@/utils/mapper/ledgerMapper.ts'

//Create
export async function postLedgerEntry(ledgerEntry: LedgerEntry): Promise<LedgerEntry> {
  const {data} = await apiClient.post("/ledgerEntry", toDTO(ledgerEntry))
  return fromDTO(data)
}

//Read
export async function getLedgerEntryById(id: number): Promise<LedgerEntry> {
  const {data} = await apiClient.get(`/ledgerEntry/${id}`)
  return fromDTO(data)
}

export async function getLedger(page?: number, size?: number, sort?: any): Promise<{content: LedgerEntry[], totalElements: number}> {
  const {data} = await apiClient.get(`/ledger`, {
    params: {
      page,
      size,
      sort: sort
    }
  })
  return fromDTOPage(data)
}

//Update
export async function putLedgerEntryById(id: number, ledgerEntry: LedgerEntry): Promise<LedgerEntry> {
  const {data} = await apiClient.put(`/ledgerEntry/${id}`, toDTO(ledgerEntry))
  return fromDTO(data)
}

//Detele
export async function deleteLedgerEntryById(id: number): Promise<void> {
  await apiClient.delete(`/ledgerEntry/${id}`)
}
