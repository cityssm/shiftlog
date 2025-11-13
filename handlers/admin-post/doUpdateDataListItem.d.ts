import type { Request, Response } from 'express';
import { type UpdateDataListItemForm } from '../../database/app/updateDataListItem.js';
export default function handler(request: Request<unknown, unknown, UpdateDataListItemForm & {
    dataListKey: string;
}>, response: Response): Promise<void>;
