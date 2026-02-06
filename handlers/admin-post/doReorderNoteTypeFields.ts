import type { Request, Response } from 'express'

import getNoteTypes, {
  type NoteTypeWithFields
} from '../../database/noteTypes/getNoteTypes.js'
import reorderNoteTypeFields, {
  type ReorderNoteTypeFieldsForm
} from '../../database/noteTypes/reorderNoteTypeFields.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoReorderNoteTypeFieldsResponse = {
  success: boolean
  noteTypes?: NoteTypeWithFields[]
}

export default async function handler(
  request: Request<unknown, unknown, ReorderNoteTypeFieldsForm>,
  response: Response<DoReorderNoteTypeFieldsResponse>
): Promise<void> {
  const form = {
    ...request.body,
    userName: request.session.user?.userName ?? ''
  }

  const success = await reorderNoteTypeFields(form)

  let noteTypes: NoteTypeWithFields[] | undefined

  if (success) {
    noteTypes = await getNoteTypes()
  }

  response.json({
    success,
    noteTypes
  })
}
