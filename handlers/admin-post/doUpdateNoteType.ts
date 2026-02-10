import type { Request, Response } from 'express'

import getNoteTypes from '../../database/noteTypes/getNoteTypes.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'
import updateNoteType from '../../database/noteTypes/updateNoteType.js'

export type DoUpdateNoteTypeResponse =
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
      isAvailableShifts?: boolean | string
      isAvailableTimesheets?: boolean | string
      isAvailableWorkOrders?: boolean | string
      noteType?: string
      noteTypeId?: number | string
      userGroupId?: number | string
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
      isAvailableShifts,
      isAvailableTimesheets,
      isAvailableWorkOrders,
      noteType,
      noteTypeId,
      userGroupId
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
      message: 'Note type could not be updated.',
      success: false
    })
  }
}
