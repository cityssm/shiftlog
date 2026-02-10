import type { Request, Response } from 'express';
import { type DataListItemWithDetails } from '../../database/app/getDataListItemsAdmin.js';
interface DoAddMultipleDataListItemsForm {
    dataListKey: string;
    dataListItems: string;
    userGroupId?: number | string | null;
}
export type DoAddMultipleDataListItemsResponse = {
    success: boolean;
    items?: DataListItemWithDetails[];
    addedCount?: number;
    skippedCount?: number;
};
export default function handler(request: Request<unknown, unknown, DoAddMultipleDataListItemsForm>, response: Response<DoAddMultipleDataListItemsResponse>): Promise<void>;
export {};
