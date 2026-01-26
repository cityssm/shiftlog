import type { Request, Response } from 'express';
export type DoGetAdhocTaskTypesResponse = {
    success: boolean;
    adhocTaskTypes: AdhocTaskTypeDataListItem[];
};
export default function handler(request: Request, response: Response<DoGetAdhocTaskTypesResponse>): Promise<void>;
