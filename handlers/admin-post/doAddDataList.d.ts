import type { Request, Response } from 'express';
import { type CreateDataListForm } from '../../database/app/createDataList.js';
import { type DataList } from '../../database/app/getDataLists.js';
export type DoAddDataListResponse = {
    success: boolean;
    errorMessage?: string;
    dataLists?: DataListWithItems[];
    wasRecovered?: boolean;
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
export default function handler(request: Request<unknown, unknown, Omit<CreateDataListForm, 'isSystemList' | 'userName'>>, response: Response<DoAddDataListResponse>): Promise<void>;
export {};
