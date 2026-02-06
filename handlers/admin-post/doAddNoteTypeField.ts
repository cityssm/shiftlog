import type { Request, Response } from 'express'

import addNoteTypeField from '../../database/noteTypes/addNoteTypeField.js'
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'

export type DoAddNoteTypeFieldResponse =
  | {
      message: string
      success: false
    }
  | {
      noteTypes: NoteTypeWithFields[]
      success: true
    }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      dataListKey?: string
      fieldHelpText?: string
      fieldInputType?: 'date' | 'number' | 'select' | 'text' | 'textbox'
      fieldLabel?: string
      fieldValueMax?: number | string
      fieldValueMin?: number | string
      fieldValueRequired?: boolean | string
      hasDividerAbove?: boolean | string
      noteTypeId?: number | string
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
      dataListKey,
      fieldHelpText,
      fieldInputType,
      fieldLabel,
      fieldValueMax,
      fieldValueMin,
      fieldValueRequired,
      hasDividerAbove,
      noteTypeId
    },
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
      message: 'Field could not be added.',
      success: false
    })
  }
}
