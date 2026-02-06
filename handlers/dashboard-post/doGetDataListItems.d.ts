import type { Request, Response } from 'express';
import type { DataListItem } from '../../types/record.types.js';
export type DoGetDataListItemsResponse = {
    success: true;
    items: DataListItem[];
};
export default function handler(request: Request<object, object, {
    dataListKey: string;
}>, response: Response<DoGetDataListItemsResponse>): Promise<void>;
