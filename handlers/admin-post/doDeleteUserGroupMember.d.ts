import type { Request, Response } from 'express';
import type { UserGroup } from '../../types/record.types.js';
export type DoDeleteUserGroupMemberResponse = {
    success: boolean;
    userGroup: UserGroup | undefined;
};
export default function handler(request: Request<unknown, unknown, {
    userGroupId: string;
    userName: string;
}>, response: Response<DoDeleteUserGroupMemberResponse>): Promise<void>;
