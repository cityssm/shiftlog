export interface CreateApiAuditLogForm {
    apiKey?: string;
    endpoint: string;
    errorMessage?: string;
    ipAddress?: string;
    isValidApiKey: boolean;
    requestMethod: string;
    responseStatus?: number;
    userAgent?: string;
    userName?: string;
}
export default function createApiAuditLog(form: CreateApiAuditLogForm): Promise<boolean>;
