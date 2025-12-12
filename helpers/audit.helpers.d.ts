import type { Request } from 'express';
interface LogApiRequestOptions {
    errorMessage?: string;
    isValidApiKey: boolean;
    request: Request;
    responseStatus?: number;
    userName?: string;
}
/**
 * Logs an API request to the audit log
 * @param options - Options for logging the API request
 */
export declare function logApiRequest(options: LogApiRequestOptions): Promise<void>;
export {};
