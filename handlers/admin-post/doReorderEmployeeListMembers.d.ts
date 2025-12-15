import type { Request, Response } from 'express';
import { type ReorderEmployeeListMembersForm } from '../../database/employeeLists/reorderEmployeeListMembers.js';
export default function handler(request: Request<unknown, unknown, ReorderEmployeeListMembersForm>, response: Response): Promise<void>;
