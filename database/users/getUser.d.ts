import type { DatabaseUser } from '../../types/record.types.js';
export declare function _getUser(userField: 'apiKey' | 'userName', userNameOrApiKey: string): Promise<DatabaseUser | undefined>;
export default function getUser(userName: string): Promise<DatabaseUser | undefined>;
export declare function getUserByApiKey(apiKey: string): Promise<DatabaseUser | undefined>;
