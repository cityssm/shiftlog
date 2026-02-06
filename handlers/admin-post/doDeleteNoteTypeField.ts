import type { Request, Response } from 'express'

import deleteNoteTypeField from '../../database/noteTypes/deleteNoteTypeField.js'
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'

export type DoDeleteNoteTypeFieldResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      noteTypes: NoteTypeWithFields[]
    }

export default async function handler(
  request: Request<unknown, unknown, { noteTypeFieldId?: string | number }>,
  response: Response<DoDeleteNoteTypeFieldResponse>
): Promise<void> {
  const noteTypeFieldId = Number.parseInt(
    request.body.noteTypeFieldId as string,
    10
  )

  const success = await deleteNoteTypeField(
    noteTypeFieldId,
    request.session.user as User
  )

  if (success) {
    const noteTypes = await getNoteTypes()

    response.json({
      success: true,
      noteTypes
    })
  } else {
    response.json({
      success: false,
      message: 'Field could not be deleted.'
    })
  }
}
