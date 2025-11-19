import type { Employee } from '../../types/record.types.js';
export default function getEmployees(): Promise<Array<Partial<Employee>> | undefined>;
