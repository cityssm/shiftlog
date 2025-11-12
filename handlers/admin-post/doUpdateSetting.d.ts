import type { Request, Response } from 'express';
import { type UpdateSettingForm } from '../../database/app/updateSetting.js';
export default function handler(request: Request<unknown, unknown, UpdateSettingForm>, response: Response): Promise<void>;
