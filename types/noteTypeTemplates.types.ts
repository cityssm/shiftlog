import type { NoteType, NoteTypeField } from './record.types.js'

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
    | 'userGroupName'
    | 'recordCreate_dateTime'
    | 'recordCreate_userName'
    | 'recordUpdate_dateTime'
    | 'recordUpdate_userName'
    | 'recordDelete_dateTime'
    | 'recordDelete_userName'
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
      | 'recordUpdate_dateTime'
      | 'recordUpdate_userName'
      | 'recordDelete_dateTime'
      | 'recordDelete_userName'
    >
  >
}
