import type { Request, Response } from 'express'

import addNoteType from '../../database/noteTypes/addNoteType.js'
import addNoteTypeField from '../../database/noteTypes/addNoteTypeField.js'
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'
import { getNoteTypeTemplateById } from '../../helpers/noteTypeTemplates.helpers.js'

export type DoAddNoteTypeFromTemplateResponse =
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
  request: Request<
    unknown,
    unknown,
    {
      templateId?: string
    }
  >,
  response: Response<DoAddNoteTypeFromTemplateResponse>
): Promise<void> {
  const templateId = request.body.templateId

  if (!templateId) {
    response.json({
      message: 'Template ID is required.',
      success: false
    })
    return
  }

  const template = getNoteTypeTemplateById(templateId)

  if (!template) {
    response.json({
      message: 'Template not found.',
      success: false
    })
    return
  }

  // Create the note type
  const noteTypeSuccess = await addNoteType(
    {
      noteType: template.noteType.noteType,
      userGroupId: template.noteType.userGroupId,
      isAvailableWorkOrders: template.noteType.isAvailableWorkOrders,
      isAvailableShifts: template.noteType.isAvailableShifts,
      isAvailableTimesheets: template.noteType.isAvailableTimesheets
    },
    request.session.user as User
  )

  if (!noteTypeSuccess) {
    response.json({
      message:
        'Note type could not be created from template. Note type name may already exist.',
      success: false
    })
    return
  }

  // Get the newly created note type to retrieve its ID
  const allNoteTypes = await getNoteTypes()
  const newNoteType = allNoteTypes.find(
    (nt) => nt.noteType === template.noteType.noteType
  )

  if (!newNoteType) {
    response.json({
      message: 'Note type was created but could not be retrieved.',
      success: false
    })
    return
  }

  // Add all fields from the template
  for (const field of template.fields) {
    await addNoteTypeField(
      {
        noteTypeId: newNoteType.noteTypeId,
        fieldLabel: field.fieldLabel,
        fieldInputType: field.fieldInputType,
        fieldUnitPrefix: field.fieldUnitPrefix,
        fieldUnitSuffix: field.fieldUnitSuffix,
        fieldHelpText: field.fieldHelpText,
        dataListKey: field.dataListKey,
        fieldValueMin: field.fieldValueMin,
        fieldValueMax: field.fieldValueMax,
        fieldValueRequired: field.fieldValueRequired,
        hasDividerAbove: field.hasDividerAbove
      },
      request.session.user as User
    )
  }

  // Get updated note types with fields
  const noteTypes = await getNoteTypes()

  response.json({
    noteTypes,
    success: true
  })
}
