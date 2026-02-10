import type { Request, Response } from 'express';
import { type AddDataListItemForm } from '../../database/app/addDataListItem.js';
import { type DataListItemWithDetails } from '../../database/app/getDataListItemsAdmin.js';
export type DoAddDataListItemResponse = {
    success: boolean;
    items?: DataListItemWithDetails[];
};
export default function handler(request: Request<unknown, unknown, AddDataListItemForm>, response: Response<DoAddDataListItemResponse>): Promise<void>;
