import type { ApiAuditLog } from '../../types/record.types.js';
export interface GetApiAuditLogsFilters {
    endDate?: string;
    isValidApiKey?: boolean;
    limit?: number;
    offset?: number;
    startDate?: string;
    userName?: string;
}
export interface GetApiAuditLogsResult {
    logs: ApiAuditLog[];
    totalCount: number;
}
export default function getApiAuditLogs(filters?: GetApiAuditLogsFilters): Promise<GetApiAuditLogsResult>;
