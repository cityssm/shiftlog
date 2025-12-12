export interface CreateApiAuditLogForm {
    userName?: string;
    apiKey?: string;
    endpoint: string;
    requestMethod: string;
    isValidApiKey: boolean;
    ipAddress?: string;
    userAgent?: string;
    responseStatus?: number;
    errorMessage?: string;
}
export default function createApiAuditLog(form: CreateApiAuditLogForm): Promise<boolean>;
