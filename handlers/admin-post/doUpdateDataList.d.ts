import type { Request, Response } from 'express';
import { type UpdateDataListForm } from '../../database/app/updateDataList.js';
import type { DataList } from '../../types/record.types.js';
export type DoUpdateDataListResponse = {
    success: boolean;
    errorMessage?: string;
    dataLists?: DataList[];
};
export default function handler(request: Request<unknown, unknown, Omit<UpdateDataListForm, 'userName'>>, response: Response<DoUpdateDataListResponse>): Promise<void>;
