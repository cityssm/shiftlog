import type { Request, Response } from 'express';
import getUserGroup from '../../database/users/getUserGroup.js';
export type DoAddUserGroupMemberResponse = {
    success: boolean;
    userGroup: Awaited<ReturnType<typeof getUserGroup>>;
};
export default function handler(request: Request<unknown, unknown, {
    userGroupId: string;
    userName: string;
}>, response: Response<DoAddUserGroupMemberResponse>): Promise<void>;
