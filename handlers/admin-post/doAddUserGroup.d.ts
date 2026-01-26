import type { Request, Response } from 'express';
import getUserGroups from '../../database/users/getUserGroups.js';
export type DoAddUserGroupResponse = {
    success: boolean;
    userGroupId: number | undefined;
    userGroups: Awaited<ReturnType<typeof getUserGroups>>;
};
export default function handler(request: Request<unknown, unknown, {
    userGroupName: string;
}>, response: Response<DoAddUserGroupResponse>): Promise<void>;
