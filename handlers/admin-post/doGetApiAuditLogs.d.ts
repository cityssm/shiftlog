import type { Request, Response } from 'express';
import { type GetApiAuditLogsFilters } from '../../database/api/getApiAuditLogs.js';
export default function handler(request: Request<unknown, unknown, GetApiAuditLogsFilters>, response: Response): Promise<void>;
