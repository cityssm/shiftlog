import type { Request, Response } from 'express';
import { type EmployeeContactFields } from '../../database/employees/updateEmployeeContactByUserName.js';
export default function handler(request: Request<unknown, unknown, EmployeeContactFields>, response: Response): Promise<void>;
