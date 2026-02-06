import type { Request, Response } from 'express';
import type { DeleteDataListForm } from '../../database/app/deleteDataList.js';
import type { DataList } from '../../database/app/getDataLists.js';
export type DoDeleteDataListResponse = {
    success: boolean;
    errorMessage?: string;
    dataLists?: DataList[];
};
export default function handler(request: Request<unknown, unknown, Omit<DeleteDataListForm, 'userName'>>, response: Response<DoDeleteDataListResponse>): Promise<void>;
