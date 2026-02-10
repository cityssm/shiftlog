import type { NotificationQueueType } from '../tasks/notifications/types.js'

import type { NoteType, NoteTypeField } from './record.types.js'

/*
 * Worker Messages
 */

export interface ClearCacheWorkerMessage extends WorkerMessage {
  messageType: 'clearCache'
  targetProcesses: 'workers'

  tableName: string
}

export interface SendNotificationWorkerMessage extends WorkerMessage {
  messageType: 'sendNotification'
  targetProcesses: 'task.notifications'

  notificationQueue: NotificationQueueType
  recordId: number
}

export interface WorkerMessage {
  messageType: string

  sourcePid: number
  sourceTimeMillis: number
  targetProcesses: 'task.notifications' | 'workers'
}

/*
 * Note Type Templates
 */

/**
 * Template for creating a note type with predefined fields
 * Omits database-specific fields that are auto-generated
 */
export interface NoteTypeTemplate {
  /**
   * Unique identifier for the template
   */
  templateId: string

  /**
   * Display name for the template
   */
  templateName: string

  /**
   * Description of what this template is for
   */
  templateDescription: string

  /**
   * Note type properties (omitting auto-generated fields)
   */
  noteType: Omit<
    NoteType,
    | 'noteTypeId'
    | 'recordCreate_dateTime'
    | 'recordCreate_userName'
    | 'recordDelete_dateTime'
    | 'recordDelete_userName'
    | 'recordUpdate_dateTime'
    | 'recordUpdate_userName'
    | 'userGroupName'
  >

  /**
   * Field definitions (omitting auto-generated fields)
   */
  fields: Array<
    Omit<
      NoteTypeField,
      | 'noteTypeFieldId'
      | 'noteTypeId'
      | 'recordCreate_dateTime'
      | 'recordCreate_userName'
      | 'recordDelete_dateTime'
      | 'recordDelete_userName'
      | 'recordUpdate_dateTime'
      | 'recordUpdate_userName'
    >
  >
}
