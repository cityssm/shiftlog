import type { Request, Response } from 'express';
import getUserGroups from '../../database/users/getUserGroups.js';
export type DoDeleteUserGroupResponse = {
    success: boolean;
    userGroups: Awaited<ReturnType<typeof getUserGroups>>;
};
export default function handler(request: Request<unknown, unknown, {
    userGroupId: string;
}>, response: Response<DoDeleteUserGroupResponse>): Promise<void>;
