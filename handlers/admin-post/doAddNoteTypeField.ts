import type { Request, Response } from 'express'

import addNoteTypeField from '../../database/noteTypes/addNoteTypeField.js'
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'

export type DoAddNoteTypeFieldResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      noteTypes: NoteTypeWithFields[]
    }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      noteTypeId?: string | number
      fieldLabel?: string
      fieldInputType?: 'text' | 'number' | 'date' | 'select' | 'textbox'
      fieldHelpText?: string
      dataListKey?: string
      fieldValueMin?: string | number
      fieldValueMax?: string | number
      fieldValueRequired?: string | boolean
      hasDividerAbove?: string | boolean
    }
  >,
  response: Response<DoAddNoteTypeFieldResponse>
): Promise<void> {
  const noteTypeId = Number.parseInt(request.body.noteTypeId as string, 10)
  const fieldLabel = request.body.fieldLabel ?? ''
  const fieldInputType = request.body.fieldInputType ?? 'text'
  const fieldHelpText = request.body.fieldHelpText ?? ''
  const dataListKey =
    request.body.dataListKey === '' || request.body.dataListKey === undefined
      ? null
      : request.body.dataListKey
  const fieldValueMin =
    request.body.fieldValueMin === '' ||
    request.body.fieldValueMin === undefined
      ? null
      : Number.parseInt(request.body.fieldValueMin as string, 10)
  const fieldValueMax =
    request.body.fieldValueMax === '' ||
    request.body.fieldValueMax === undefined
      ? null
      : Number.parseInt(request.body.fieldValueMax as string, 10)
  const fieldValueRequired =
    request.body.fieldValueRequired === true ||
    request.body.fieldValueRequired === '1'
  const hasDividerAbove =
    request.body.hasDividerAbove === true ||
    request.body.hasDividerAbove === '1'

  const success = await addNoteTypeField(
    {
      noteTypeId,
      fieldLabel,
      fieldInputType,
      fieldHelpText,
      dataListKey,
      fieldValueMin,
      fieldValueMax,
      fieldValueRequired,
      hasDividerAbove
    },
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
      message: 'Field could not be added.'
    })
  }
}
