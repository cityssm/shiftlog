import type { DatabaseUser } from '../../types/record.types.js';
export default function getUsers(): Promise<DatabaseUser[]>;
export declare function getUserCount(): Promise<number>;
