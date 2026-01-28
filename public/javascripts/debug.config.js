import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_AVANTI } from '@cityssm/avanti-api/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_MSSQL } from '@cityssm/mssql-multi-pool/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_TASK } from '@cityssm/scheduled-task/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_WORKTECH } from '@cityssm/worktech-api/debug';
export const DEBUG_NAMESPACE = 'shiftlog';
export const DEBUG_ENABLE_NAMESPACES = [
    `${DEBUG_NAMESPACE}:*`,
    DEBUG_ENABLE_NAMESPACES_AVANTI,
    DEBUG_ENABLE_NAMESPACES_MSSQL,
    DEBUG_ENABLE_NAMESPACES_TASK,
    DEBUG_ENABLE_NAMESPACES_WORKTECH
].join(',');
export const PROCESS_ID_MAX_DIGITS = 5;
//# sourceMappingURL=debug.config.js.map