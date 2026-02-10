import type { Request, Response } from 'express';
import { type DataList } from '../../database/app/getDataLists.js';
import { type UpdateDataListForm } from '../../database/app/updateDataList.js';
export type DoUpdateDataListResponse = {
    success: boolean;
    errorMessage?: string;
    dataLists?: DataListWithItems[];
};
interface DataListWithItems extends DataList {
    items: Array<{
        dataListItemId: number;
        dataListKey: string;
        dataListItem: string;
        orderNumber: number;
        userGroupId: number | null;
    }>;
}
export default function handler(request: Request<unknown, unknown, Omit<UpdateDataListForm, 'userName'>>, response: Response<DoUpdateDataListResponse>): Promise<void>;
export {};
