import type { Request, Response } from 'express'

import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'
import updateNoteTypeField from '../../database/noteTypes/updateNoteTypeField.js'

export type DoUpdateNoteTypeFieldResponse =
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
      fieldUnitPrefix?: string
      fieldUnitSuffix?: string
      fieldValueMax?: number | string
      fieldValueMin?: number | string
      fieldValueRequired?: boolean | string
      hasDividerAbove?: boolean | string
      noteTypeFieldId?: number | string
    }
  >,
  response: Response<DoUpdateNoteTypeFieldResponse>
): Promise<void> {
  const noteTypeFieldId = Number.parseInt(
    request.body.noteTypeFieldId as string,
    10
  )
  const fieldLabel = request.body.fieldLabel ?? ''
  const fieldInputType = request.body.fieldInputType ?? 'text'
  const fieldUnitPrefix = request.body.fieldUnitPrefix ?? ''
  const fieldUnitSuffix = request.body.fieldUnitSuffix ?? ''
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

  const success = await updateNoteTypeField(
    {
      dataListKey,
      fieldHelpText,
      fieldInputType,
      fieldLabel,
      fieldUnitPrefix,
      fieldUnitSuffix,
      fieldValueMax,
      fieldValueMin,
      fieldValueRequired,
      hasDividerAbove,
      noteTypeFieldId
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
      message: 'Field could not be updated.',
      success: false
    })
  }
}
