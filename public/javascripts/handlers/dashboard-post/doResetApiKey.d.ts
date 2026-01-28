import type { Request, Response } from 'express';
export type DoResetApiKeyResponse = {
    success: true;
    apiKey: string;
};
export default function handler(request: Request, response: Response<DoResetApiKeyResponse>): Promise<void>;
//# sourceMappingURL=doResetApiKey.d.ts.map