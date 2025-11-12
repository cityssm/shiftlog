export interface ClearCacheWorkerMessage extends WorkerMessage {
    messageType: 'clearCache';
    tableName: string;
}
export interface WorkerMessage {
    messageType: string;
    pid: number;
    timeMillis: number;
}
