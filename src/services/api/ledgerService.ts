import apiClient from '@/services/api/apiClient'
import type { LedgerEntry, LedgerEntryDTO, LedgerEntryLight } from '@/types/ledgerEntry'
import { fromDTO, fromLightDTO, toDTO } from '@/utils/mapper/ledgerMapper'
import { printPageInFrame } from '@/services/api/printService'

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

export async function getArchivedLedger(year: number): Promise<LedgerEntryLight[]> {
  const { data } = await apiClient.get(`/archive/ledger`, { params: { year } })
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

export async function archiveLedgerEntryById(id: number): Promise<void> {
  await apiClient.patch(`/ledgerEntry/${id}/archive`)
}

export async function restoreLedgerEntryById(id: number): Promise<LedgerEntry> {
  const { data } = await apiClient.patch(`/ledgerEntry/${id}/restore`)
  return fromDTO(data)
}

//Delete (fisica, solo admin e solo se già archiviata)
export async function deleteLedgerEntryById(id: number): Promise<void> {
  await apiClient.delete(`/ledgerEntry/${id}`)
}

export function print(fromDate: string, toDate: string): Promise<void> {
  return printPageInFrame('/ledger/print', { from: fromDate, to: toDate })
}
