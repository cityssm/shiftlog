import type { Request, Response } from 'express';
import type { UserGroup } from '../../types/record.types.js';
export type DoGetUserGroupResponse = {
    userGroup: UserGroup | undefined;
};
export default function handler(request: Request<unknown, unknown, {
    userGroupId: string;
}>, response: Response<DoGetUserGroupResponse>): Promise<void>;
