import type { Request, Response } from 'express';
export type DoGetRequestorSuggestionsResponse = {
    success: true;
    requestors: Array<{
        requestorContactInfo: string;
        requestorName: string;
    }>;
};
export default function handler(request: Request<unknown, unknown, {
    searchString: string;
}>, response: Response<DoGetRequestorSuggestionsResponse>): Promise<void>;
