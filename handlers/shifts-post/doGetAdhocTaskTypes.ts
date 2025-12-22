import type { Request, Response } from 'express'

import getAdhocTaskTypeDataListItems from '../../database/adhocTasks/getAdhocTaskTypeDataListItems.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const adhocTaskTypes = await getAdhocTaskTypeDataListItems(
    request.session.user
  )

  response.json({
    success: true,
    adhocTaskTypes
  })
}
