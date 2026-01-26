import type { Request, Response } from 'express';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import { type ReorderDataListItemsForm } from '../../database/app/reorderDataListItems.js';
export type DoReorderDataListItemsResponse = {
    success: boolean;
    items?: Awaited<ReturnType<typeof getDataListItemsAdmin>>;
};
export default function handler(request: Request<unknown, unknown, ReorderDataListItemsForm>, response: Response<DoReorderDataListItemsResponse>): Promise<void>;
