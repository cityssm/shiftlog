import type { Request, Response } from 'express'

import updateNoteType from '../../database/noteTypes/updateNoteType.js'
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'

export type DoUpdateNoteTypeResponse =
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
      noteType?: string
      userGroupId?: string | number
      isAvailableWorkOrders?: string | boolean
      isAvailableShifts?: string | boolean
      isAvailableTimesheets?: string | boolean
    }
  >,
  response: Response<DoUpdateNoteTypeResponse>
): Promise<void> {
  const noteTypeId = Number.parseInt(request.body.noteTypeId as string, 10)
  const noteType = request.body.noteType ?? ''
  const userGroupId =
    request.body.userGroupId === '' || request.body.userGroupId === undefined
      ? null
      : Number.parseInt(request.body.userGroupId as string, 10)

  const isAvailableWorkOrders =
    request.body.isAvailableWorkOrders === true ||
    request.body.isAvailableWorkOrders === '1'
  const isAvailableShifts =
    request.body.isAvailableShifts === true ||
    request.body.isAvailableShifts === '1'
  const isAvailableTimesheets =
    request.body.isAvailableTimesheets === true ||
    request.body.isAvailableTimesheets === '1'

  const success = await updateNoteType(
    {
      noteTypeId,
      noteType,
      userGroupId,
      isAvailableWorkOrders,
      isAvailableShifts,
      isAvailableTimesheets
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
      message: 'Note type could not be updated.'
    })
  }
}
