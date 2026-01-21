import { type ChildProcess } from 'node:child_process';
type OptionalTaskName = 'employeeSync' | 'equipmentSync' | 'locationSync' | 'notifications';
type RequiredTaskName = 'databaseCleanup';
export type InitializeTasksReturn = Partial<Record<OptionalTaskName, ChildProcess>> & Record<RequiredTaskName, ChildProcess>;
export declare function initializeTasks(): InitializeTasksReturn;
export {};
