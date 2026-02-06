import type { Request, Response } from 'express'

import deleteNoteType from '../../database/noteTypes/deleteNoteType.js'
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'

export type DoDeleteNoteTypeResponse =
  | {
      message: string
      success: false
    }
  | {
      message?: undefined
      noteTypes: NoteTypeWithFields[]
      success: true
    }

export default async function handler(
  request: Request<unknown, unknown, { noteTypeId?: number | string }>,
  response: Response<DoDeleteNoteTypeResponse>
): Promise<void> {
  const noteTypeId = Number.parseInt(request.body.noteTypeId as string, 10)

  const success = await deleteNoteType(
    noteTypeId,
    request.session.user as User
  )

  if (success) {
    const noteTypes = await getNoteTypes()

    response.json({
      noteTypes,
      success: true
    })
  } else {
    response.json({
      message: 'Note type could not be deleted.',
      success: false
    })
  }
}
