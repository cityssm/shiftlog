import type { Request, Response } from 'express'

import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js'
import updateAdhocTask from '../../database/adhocTasks/updateAdhocTask.js'

type LatitudeLongitude = number | string | null | undefined

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateAdhocTaskResponse = {
  success: boolean
  errorMessage?: string
  shiftAdhocTasks?: Awaited<ReturnType<typeof getShiftAdhocTasks>>
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      adhocTaskId: number | string
      adhocTaskTypeDataListItemId: number | string
      taskDescription: string
      
      shiftId: number | string

      locationAddress1: string
      locationAddress2: string
      locationCityProvince: string
      locationLatitude: LatitudeLongitude
      locationLongitude: LatitudeLongitude

      fromLocationAddress1: string
      fromLocationAddress2: string
      fromLocationCityProvince: string
      fromLocationLatitude: LatitudeLongitude
      fromLocationLongitude: LatitudeLongitude

      toLocationAddress1: string
      toLocationAddress2: string
      toLocationCityProvince: string
      toLocationLatitude: LatitudeLongitude
      toLocationLongitude: LatitudeLongitude

      taskCompleteDateTimeString: string | null | undefined
      taskDueDateTimeString: string | null | undefined
    }
  >,
  response: Response<DoUpdateAdhocTaskResponse>
): Promise<void> {
  const success = await updateAdhocTask(
    {
      adhocTaskId: request.body.adhocTaskId,
      adhocTaskTypeDataListItemId: request.body.adhocTaskTypeDataListItemId,
      taskDescription: request.body.taskDescription,

      locationAddress1: request.body.locationAddress1,
      locationAddress2: request.body.locationAddress2,
      locationCityProvince: request.body.locationCityProvince,
      locationLatitude: request.body.locationLatitude,
      locationLongitude: request.body.locationLongitude,

      fromLocationAddress1: request.body.fromLocationAddress1,
      fromLocationAddress2: request.body.fromLocationAddress2,
      fromLocationCityProvince: request.body.fromLocationCityProvince,
      fromLocationLatitude: request.body.fromLocationLatitude,
      fromLocationLongitude: request.body.fromLocationLongitude,

      toLocationAddress1: request.body.toLocationAddress1,
      toLocationAddress2: request.body.toLocationAddress2,
      toLocationCityProvince: request.body.toLocationCityProvince,
      toLocationLatitude: request.body.toLocationLatitude,
      toLocationLongitude: request.body.toLocationLongitude,

      taskCompleteDateTimeString: request.body.taskCompleteDateTimeString,
      taskDueDateTimeString: request.body.taskDueDateTimeString
    },
    request.session.user as { userName: string }
  )

  if (success) {
    const shiftAdhocTasks = await getShiftAdhocTasks(request.body.shiftId)

    response.json({
      success: true,

      shiftAdhocTasks
    } satisfies DoUpdateAdhocTaskResponse)
  } else {
    response.json({
      success: false,

      errorMessage: 'Failed to update ad hoc task.'
    } satisfies DoUpdateAdhocTaskResponse)
  }
}
