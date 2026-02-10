export declare function preloadCaches(): void;
export declare const cacheTableNames: readonly ["ApplicationSettings", "UserSettings"];
export type CacheTableNames = (typeof cacheTableNames)[number];
export declare function clearCacheByTableName(tableName: CacheTableNames, relayMessage?: boolean): void;
export declare function clearCaches(): void;
