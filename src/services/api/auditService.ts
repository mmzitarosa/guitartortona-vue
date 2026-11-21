import apiClient from '@/services/api/apiClient'
import type { AuditLog, AuditQuery } from '@/types/audit'
import type { Page } from '@/services/api/productService'

export async function getAuditLog(query: AuditQuery): Promise<Page<AuditLog>> {
  const { data } = await apiClient.get<Page<AuditLog>>('/audit', { params: query })
  return data
}
