import type { Request, Response } from 'express'

import getNoteTypes, {
  type NoteTypeWithFields
} from '../../database/noteTypes/getNoteTypes.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetNoteTypesResponse = {
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
