import type { Request, Response } from 'express';
import { type ReorderDataListItemsForm } from '../../database/app/reorderDataListItems.js';
export default function handler(request: Request<unknown, unknown, ReorderDataListItemsForm>, response: Response): Promise<void>;
