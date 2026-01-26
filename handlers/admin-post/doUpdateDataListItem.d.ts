import type { Request, Response } from 'express';
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js';
import { type UpdateDataListItemForm } from '../../database/app/updateDataListItem.js';
export type DoUpdateDataListItemResponse = {
    success: boolean;
    items?: Awaited<ReturnType<typeof getDataListItemsAdmin>>;
};
export default function handler(request: Request<unknown, unknown, UpdateDataListItemForm & {
    dataListKey: string;
}>, response: Response<DoUpdateDataListItemResponse>): Promise<void>;
