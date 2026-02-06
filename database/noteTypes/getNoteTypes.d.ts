import type { NoteType, NoteTypeField } from '../../types/record.types.js';
export interface NoteTypeWithFields extends NoteType {
    fields: NoteTypeField[];
}
export default function getNoteTypes(): Promise<NoteTypeWithFields[]>;
