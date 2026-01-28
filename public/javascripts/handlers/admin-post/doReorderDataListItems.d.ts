import type { Request, Response } from 'express';
import { type DataListItemWithDetails } from '../../database/app/getDataListItemsAdmin.js';
import { type ReorderDataListItemsForm } from '../../database/app/reorderDataListItems.js';
export type DoReorderDataListItemsResponse = {
    success: boolean;
    items?: DataListItemWithDetails[];
};
export default function handler(request: Request<unknown, unknown, ReorderDataListItemsForm>, response: Response<DoReorderDataListItemsResponse>): Promise<void>;
//# sourceMappingURL=doReorderDataListItems.d.ts.map