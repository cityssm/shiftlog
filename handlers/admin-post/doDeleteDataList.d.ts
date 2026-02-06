import type { Request, Response } from 'express';
import type { DeleteDataListForm } from '../../database/app/deleteDataList.js';
import type { DataList } from '../../database/app/getDataLists.js';
export type DoDeleteDataListResponse = {
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
export default function handler(request: Request<unknown, unknown, Omit<DeleteDataListForm, 'userName'>>, response: Response<DoDeleteDataListResponse>): Promise<void>;
export {};
