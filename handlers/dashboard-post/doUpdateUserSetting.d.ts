import type { Request, Response } from 'express';
export type DoUpdateUserSettingResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    settingKey: string;
    settingValue: string;
}>, response: Response<DoUpdateUserSettingResponse>): Promise<void>;
