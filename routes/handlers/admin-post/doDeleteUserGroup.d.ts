import type { Request, Response } from 'express';
import type { UserGroup } from '../../types/record.types.js';
export type DoDeleteUserGroupResponse = {
    success: boolean;
    userGroups: UserGroup[];
};
export default function handler(request: Request<unknown, unknown, {
    userGroupId: string;
}>, response: Response<DoDeleteUserGroupResponse>): Promise<void>;
