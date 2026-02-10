import type { NoteTypeTemplate } from '../types/noteTypeTemplates.types.js';
/**
 * Get all available note type templates
 */
export declare function getNoteTypeTemplates(): NoteTypeTemplate[];
/**
 * Get a specific note type template by ID
 */
export declare function getNoteTypeTemplateById(templateId: string): NoteTypeTemplate | undefined;
