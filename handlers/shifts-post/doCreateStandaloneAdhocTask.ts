import type { Request, Response } from 'express'

import createAdhocTask from '../../database/adhocTasks/createAdhocTask.js'
import getAvailableAdhocTasks from '../../database/adhocTasks/getAvailableAdhocTasks.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
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
    }
  >,
  response: Response
): Promise<void> {
  // Create the ad hoc task without assigning to a shift
  const adhocTaskId = await createAdhocTask(
    {
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
      taskDueDateTimeString: request.body.taskDueDateTimeString
    },
    request.session.user as { userName: string }
  )

  if (adhocTaskId === undefined) {
    response.json({
      success: false,
      errorMessage: 'Failed to create ad hoc task.'
    })
    return
  }

  // Get all available adhoc tasks to return
  const adhocTasks = await getAvailableAdhocTasks()

  response.json({
    success: true,
    adhocTaskId,
    adhocTasks
  })
}
