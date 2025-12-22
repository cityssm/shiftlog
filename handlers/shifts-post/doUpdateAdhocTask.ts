import type { Request, Response } from 'express'

import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js'
import updateAdhocTask from '../../database/adhocTasks/updateAdhocTask.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      shiftId: number | string
      adhocTaskId: number | string
      adhocTaskTypeDataListItemId: number | string
      taskDescription: string
      locationAddress1: string
      locationAddress2: string
      locationCityProvince: string
      locationLatitude: number | string | null | undefined
      locationLongitude: number | string | null | undefined
      fromLocationAddress1: string
      fromLocationAddress2: string
      fromLocationCityProvince: string
      fromLocationLatitude: number | string | null | undefined
      fromLocationLongitude: number | string | null | undefined
      toLocationAddress1: string
      toLocationAddress2: string
      toLocationCityProvince: string
      toLocationLatitude: number | string | null | undefined
      toLocationLongitude: number | string | null | undefined
      taskDueDateTimeString: string | null | undefined
      taskCompleteDateTimeString: string | null | undefined
    }
  >,
  response: Response
): Promise<void> {
  const success = await updateAdhocTask(
    request.body.adhocTaskId,
    request.body.adhocTaskTypeDataListItemId,
    request.body.taskDescription,
    request.body.locationAddress1,
    request.body.locationAddress2,
    request.body.locationCityProvince,
    request.body.locationLatitude,
    request.body.locationLongitude,
    request.body.fromLocationAddress1,
    request.body.fromLocationAddress2,
    request.body.fromLocationCityProvince,
    request.body.fromLocationLatitude,
    request.body.fromLocationLongitude,
    request.body.toLocationAddress1,
    request.body.toLocationAddress2,
    request.body.toLocationCityProvince,
    request.body.toLocationLatitude,
    request.body.toLocationLongitude,
    request.body.taskDueDateTimeString,
    request.body.taskCompleteDateTimeString,
    request.session.user as { userName: string }
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
      errorMessage: 'Failed to update ad hoc task.'
    })
  }
}
