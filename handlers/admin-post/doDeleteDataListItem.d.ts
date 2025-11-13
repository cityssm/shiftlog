import type { Request, Response } from 'express';
import { type DeleteDataListItemForm } from '../../database/app/deleteDataListItem.js';
export default function handler(request: Request<unknown, unknown, DeleteDataListItemForm & {
    dataListKey: string;
}>, response: Response): Promise<void>;
