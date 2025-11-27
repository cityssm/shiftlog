import type { Request, Response } from 'express';
interface ReorderWorkOrderTypesForm {
    workOrderTypeIds: Array<number | string>;
}
export default function handler(request: Request<unknown, unknown, ReorderWorkOrderTypesForm>, response: Response): Promise<void>;
export {};
