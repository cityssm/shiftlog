import type { ApiAuditLog } from '../../types/record.types.js';
export interface GetApiAuditLogsFilters {
    userName?: string;
    isValidApiKey?: boolean;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}
export default function getApiAuditLogs(filters?: GetApiAuditLogsFilters): Promise<ApiAuditLog[]>;
