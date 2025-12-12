import type { Request } from 'express';
/**
 * Logs an API request to the audit log
 * @param request - Express request object
 * @param isValidApiKey - Whether the API key was valid
 * @param userName - Username associated with the API key (if valid)
 * @param responseStatus - HTTP response status code
 * @param errorMessage - Error message if request failed
 */
export declare function logApiRequest(request: Request, isValidApiKey: boolean, userName?: string, responseStatus?: number, errorMessage?: string): Promise<void>;
