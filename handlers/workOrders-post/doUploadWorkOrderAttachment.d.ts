import type { Request, Response } from 'express';
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
export default function handler(request: MulterRequest, response: Response): Promise<void>;
export {};
