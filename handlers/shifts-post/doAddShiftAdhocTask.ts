import type { Request, Response } from 'express'

import addShiftAdhocTask from '../../database/adhocTasks/addShiftAdhocTask.js'
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js'
import isAdhocTaskOnShift from '../../database/adhocTasks/isAdhocTaskOnShift.js'
import type { AdhocTask } from '../../types/record.types.js'

export type DoAddShiftAdhocTaskResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      shiftAdhocTasks: AdhocTask[]
    }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      shiftId: number | string
      adhocTaskId: number | string
      shiftAdhocTaskNote: string
    }
  >,
  response: Response<DoAddShiftAdhocTaskResponse>
): Promise<void> {
  // Check if task is already on this shift
  const alreadyExists = await isAdhocTaskOnShift(
    request.body.shiftId,
    request.body.adhocTaskId
  )

  if (alreadyExists) {
    response.json({
      success: false,
      errorMessage: 'This task is already assigned to the shift.'
    })
    return
  }

  const success = await addShiftAdhocTask(
    request.body.shiftId,
    request.body.adhocTaskId,
    request.body.shiftAdhocTaskNote
  )

  if (success) {
    const shiftAdhocTasks = await getShiftAdhocTasks(request.body.shiftId)

    response.json({
      success: true,
      shiftAdhocTasks
    })
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to add task to shift.'
    })
  }
}
