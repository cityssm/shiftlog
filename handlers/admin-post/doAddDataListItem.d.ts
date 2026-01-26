import type { Request, Response } from 'express';
import { type AddDataListItemForm } from '../../database/app/addDataListItem.js';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
export type DoAddDataListItemResponse = {
    success: boolean;
    items?: Awaited<ReturnType<typeof getDataListItemsAdmin>>;
};
export default function handler(request: Request<unknown, unknown, AddDataListItemForm>, response: Response<DoAddDataListItemResponse>): Promise<void>;
