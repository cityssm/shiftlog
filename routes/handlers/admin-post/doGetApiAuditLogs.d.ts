import type { Request, Response } from 'express';
import { type GetApiAuditLogsFilters } from '../../database/api/getApiAuditLogs.js';
import type { ApiAuditLog } from '../../types/record.types.js';
export type DoGetApiAuditLogsResponse = {
    success: true;
    totalCount: number;
    logs: ApiAuditLog[];
};
export default function handler(request: Request<unknown, unknown, GetApiAuditLogsFilters>, response: Response<DoGetApiAuditLogsResponse>): Promise<void>;
