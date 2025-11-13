import type { Request, Response } from 'express';
import { type AddDataListItemForm } from '../../database/app/addDataListItem.js';
export default function handler(request: Request<unknown, unknown, AddDataListItemForm>, response: Response): Promise<void>;
