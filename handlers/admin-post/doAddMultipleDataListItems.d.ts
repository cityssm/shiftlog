import type { Request, Response } from 'express';
import { type DataListItemWithDetails } from '../../database/app/getDataListItemsAdmin.js';
interface DoAddMultipleDataListItemsForm {
    dataListItems: string;
    dataListKey: string;
    userGroupId?: number | string | null;
}
export type DoAddMultipleDataListItemsResponse = {
    addedCount?: number;
    items?: DataListItemWithDetails[];
    skippedCount?: number;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, DoAddMultipleDataListItemsForm>, response: Response<DoAddMultipleDataListItemsResponse>): Promise<void>;
export {};
