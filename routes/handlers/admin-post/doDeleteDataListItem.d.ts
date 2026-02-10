import type { Request, Response } from 'express';
import { type DeleteDataListItemForm } from '../../database/app/deleteDataListItem.js';
import { type DataListItemWithDetails } from '../../database/app/getDataListItemsAdmin.js';
export type DoDeleteDataListItemResponse = {
    success: boolean;
    items?: DataListItemWithDetails[];
};
export default function handler(request: Request<unknown, unknown, DeleteDataListItemForm & {
    dataListKey: string;
}>, response: Response<DoDeleteDataListItemResponse>): Promise<void>;
