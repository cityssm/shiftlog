import type { Request, Response } from 'express';
import { type DataListItemWithDetails } from '../../database/app/getDataListItemsAdmin.js';
export interface AddMultipleDataListItemsForm {
    dataListKey: string;
    dataListItems: string;
    userGroupId?: number | string | null;
}
export type DoAddMultipleDataListItemsResponse = {
    success: boolean;
    addedCount?: number;
    skippedCount?: number;
    items?: DataListItemWithDetails[];
};
export default function handler(request: Request<unknown, unknown, AddMultipleDataListItemsForm>, response: Response<DoAddMultipleDataListItemsResponse>): Promise<void>;
