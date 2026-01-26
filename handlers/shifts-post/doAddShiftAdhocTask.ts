import type { Request, Response } from 'express'

import addShiftAdhocTask from '../../database/adhocTasks/addShiftAdhocTask.js'
import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js'
import isAdhocTaskOnShift from '../../database/adhocTasks/isAdhocTaskOnShift.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddShiftAdhocTaskResponse = {
  success: boolean
  errorMessage?: string
  shiftAdhocTasks?: Awaited<ReturnType<typeof getShiftAdhocTasks>>
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
    } satisfies DoAddShiftAdhocTaskResponse)
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
    } satisfies DoAddShiftAdhocTaskResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to add task to shift.'
    } satisfies DoAddShiftAdhocTaskResponse)
  }
}
