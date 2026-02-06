import type { Request, Response } from 'express';
import type { CreateDataListForm } from '../../database/app/createDataList.js';
import type { DataList } from '../../database/app/getDataLists.js';
export type DoAddDataListResponse = {
    success: boolean;
    errorMessage?: string;
    dataLists?: DataList[];
};
export default function handler(request: Request<unknown, unknown, Omit<CreateDataListForm, 'isSystemList' | 'userName'>>, response: Response<DoAddDataListResponse>): Promise<void>;
