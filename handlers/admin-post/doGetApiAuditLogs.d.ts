import type { Request, Response } from 'express';
import getApiAuditLogs, { type GetApiAuditLogsFilters } from '../../database/api/getApiAuditLogs.js';
export type DoGetApiAuditLogsResponse = {
    logs: Awaited<ReturnType<typeof getApiAuditLogs>>['logs'];
    success: true;
    totalCount: number;
};
export default function handler(request: Request<unknown, unknown, GetApiAuditLogsFilters>, response: Response<DoGetApiAuditLogsResponse>): Promise<void>;
