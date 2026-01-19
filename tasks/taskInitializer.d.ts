import { type ChildProcess } from 'node:child_process';
type OptionalTaskName = 'employeeSync' | 'equipmentSync' | 'locationSync';
type RequiredTaskName = 'databaseCleanup' | 'notifications';
export type InitializeTasksReturn = Partial<Record<OptionalTaskName, ChildProcess>> & Record<RequiredTaskName, ChildProcess>;
export declare function initializeTasks(): InitializeTasksReturn;
export {};
