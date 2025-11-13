import type { UserGroup } from '../../types/record.types.js';
export default function getUserGroup(userGroupId: number): Promise<UserGroup | undefined>;
