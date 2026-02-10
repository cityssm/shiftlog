import type { Request, Response } from 'express'

import getNoteTypes, {
  type NoteTypeWithFields
} from '../../database/noteTypes/getNoteTypes.js'

export interface DoGetNoteTypesResponse {
  noteTypes: NoteTypeWithFields[]
}

export default async function handler(
  _request: Request,
  response: Response<DoGetNoteTypesResponse>
): Promise<void> {
  const allNoteTypes = await getNoteTypes()

  // Filter to only work order note types
  const workOrderNoteTypes = allNoteTypes.filter(
    (noteType) => noteType.isAvailableWorkOrders
  )

  response.json({
    noteTypes: workOrderNoteTypes
  })
}
