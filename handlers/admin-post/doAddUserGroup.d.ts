import type { Request, Response } from 'express';
import type { UserGroup } from '../../types/record.types.js';
export type DoAddUserGroupResponse = {
    success: boolean;
    userGroupId: number | undefined;
    userGroups: UserGroup[];
};
export default function handler(request: Request<unknown, unknown, {
    userGroupName: string;
}>, response: Response<DoAddUserGroupResponse>): Promise<void>;
