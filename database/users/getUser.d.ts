import type { DatabaseUser } from '../../types/record.types.js';
export default function getUser(userName: string): Promise<DatabaseUser | undefined>;
