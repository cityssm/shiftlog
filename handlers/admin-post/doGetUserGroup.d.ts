import type { Request, Response } from 'express';
import getUserGroup from '../../database/users/getUserGroup.js';
export type DoGetUserGroupResponse = {
    userGroup: Awaited<ReturnType<typeof getUserGroup>>;
};
export default function handler(request: Request<unknown, unknown, {
    userGroupId: string;
}>, response: Response<DoGetUserGroupResponse>): Promise<void>;
