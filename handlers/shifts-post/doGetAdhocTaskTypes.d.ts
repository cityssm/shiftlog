import type { Request, Response } from 'express';
import type { DataListItem } from '../../types/record.types.js';
export type DoGetAdhocTaskTypesResponse = {
    success: true;
    adhocTaskTypes: DataListItem[];
};
export default function handler(request: Request, response: Response<DoGetAdhocTaskTypesResponse>): Promise<void>;
