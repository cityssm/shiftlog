import type { Request, Response } from 'express';
import getAdhocTaskTypeDataListItems from '../../database/adhocTasks/getAdhocTaskTypeDataListItems.js';
export type DoGetAdhocTaskTypesResponse = {
    success: boolean;
    adhocTaskTypes: Awaited<ReturnType<typeof getAdhocTaskTypeDataListItems>>;
};
export default function handler(request: Request, response: Response<DoGetAdhocTaskTypesResponse>): Promise<void>;
